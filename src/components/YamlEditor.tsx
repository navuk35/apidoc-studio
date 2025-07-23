import React, { useCallback, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Download, Check, AlertTriangle, X, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as yaml from 'js-yaml';

interface YamlEditorProps {
  value: string;
  onChange: (value: string, parsed: any) => void;
  onToggleEditor?: () => void;
  editorCollapsed?: boolean;
}

interface ValidationError {
  line: number;
  message: string;
  severity: 'error' | 'warning';
}

export const YamlEditor: React.FC<YamlEditorProps> = ({ value, onChange, onToggleEditor, editorCollapsed }) => {
  const [editorValue, setEditorValue] = useState(value);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValid, setIsValid] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  const validateSpec = useCallback((content: string): { isValid: boolean; errors: ValidationError[]; parsed?: any } => {
    const errors: ValidationError[] = [];
    
    if (!content.trim()) {
      return { isValid: true, errors: [] };
    }

    try {
      // Try parsing as YAML first, then JSON
      let parsed;
      try {
        parsed = yaml.load(content);
      } catch (yamlError) {
        try {
          parsed = JSON.parse(content);
        } catch (jsonError) {
          errors.push({
            line: 1,
            message: 'Invalid YAML or JSON format',
            severity: 'error'
          });
          return { isValid: false, errors };
        }
      }

      // Basic OpenAPI validation
      if (parsed && typeof parsed === 'object') {
        if (!parsed.openapi && !parsed.swagger) {
          errors.push({
            line: 1,
            message: 'Missing required field: openapi or swagger',
            severity: 'error'
          });
        }

        if (!parsed.info) {
          errors.push({
            line: 1,
            message: 'Missing required field: info',
            severity: 'error'
          });
        } else {
          if (!parsed.info.title) {
            errors.push({
              line: 1,
              message: 'Missing required field: info.title',
              severity: 'warning'
            });
          }
          if (!parsed.info.version) {
            errors.push({
              line: 1,
              message: 'Missing required field: info.version',
              severity: 'warning'
            });
          }
        }

        if (!parsed.paths && !parsed.components) {
          errors.push({
            line: 1,
            message: 'API should have either paths or components',
            severity: 'warning'
          });
        }
      }

      const hasErrors = errors.some(e => e.severity === 'error');
      return { isValid: !hasErrors, errors, parsed };
    } catch (error) {
      errors.push({
        line: 1,
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
      return { isValid: false, errors };
    }
  }, []);

  const handleEditorChange = useCallback((newValue: string | undefined) => {
    if (newValue === undefined) return;
    
    setEditorValue(newValue);
    
    const validation = validateSpec(newValue);
    setValidationErrors(validation.errors);
    setIsValid(validation.isValid);
    
    // Only call onChange if the spec is valid
    if (validation.isValid && validation.parsed) {
      onChange(newValue, validation.parsed);
    }
  }, [validateSpec, onChange]);

  const handleSave = useCallback(() => {
    const validation = validateSpec(editorValue);
    if (validation.isValid && validation.parsed) {
      onChange(editorValue, validation.parsed);
      toast({
        title: "Saved",
        description: "Specification saved successfully",
      });
    } else {
      toast({
        title: "Cannot save",
        description: "Please fix validation errors first",
        variant: "destructive",
      });
    }
  }, [editorValue, validateSpec, onChange, toast]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([editorValue], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'openapi.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Specification downloaded as openapi.yaml",
    });
  }, [editorValue, toast]);

  const formatDocument = useCallback(() => {
    try {
      const parsed = yaml.load(editorValue);
      const formatted = yaml.dump(parsed, { indent: 2, lineWidth: 120 });
      setEditorValue(formatted);
      handleEditorChange(formatted);
      toast({
        title: "Formatted",
        description: "Document formatted successfully",
      });
    } catch (error) {
      toast({
        title: "Format failed",
        description: "Unable to format document due to syntax errors",
        variant: "destructive",
      });
    }
  }, [editorValue, handleEditorChange, toast]);

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <CardHeader className="h-16 flex-shrink-0 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onToggleEditor && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleEditor}
                className="flex items-center gap-2"
                title={editorCollapsed ? "Show Editor" : "Hide Editor"}
              >
                {editorCollapsed ? (
                  <>
                    <PanelRightOpen className="h-4 w-4" />
                    Show
                  </>
                ) : (
                  <>
                    <PanelRightClose className="h-4 w-4" />
                    Hide
                  </>
                )}
              </Button>
            )}
            <CardTitle className="text-lg">YAML Editor</CardTitle>
            <div className="flex items-center gap-2">
              {isValid ? (
                <Badge variant="secondary" className="bg-status-success/10 text-status-success border-status-success/20">
                  <Check className="h-3 w-3 mr-1" />
                  Valid
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <X className="h-3 w-3 mr-1" />
                  Invalid
                </Badge>
              )}
              {validationErrors.length > 0 && (
                <Badge variant="outline">
                  {validationErrors.length} issue{validationErrors.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={formatDocument}>
              Format
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="default" size="sm" onClick={handleSave} disabled={!isValid}>
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="flex-shrink-0 border-b border-border bg-muted/30">
          <div className="p-3 space-y-2 max-h-32 overflow-y-auto">
            {validationErrors.map((error, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                {error.severity === 'error' ? (
                  <X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-status-warning mt-0.5 flex-shrink-0" />
                )}
                <span className={error.severity === 'error' ? 'text-destructive' : 'text-status-warning'}>
                  Line {error.line}: {error.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="yaml"
          value={editorValue}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            folding: true,
            foldingStrategy: 'indentation',
            renderLineHighlight: 'line',
            selectionHighlight: false,
            occurrencesHighlight: false,
            bracketPairColorization: {
              enabled: true
            },
            overviewRulerLanes: 0,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              useShadows: false,
              verticalHasArrows: false,
              horizontalHasArrows: false
            }
          }}
        />
      </div>
    </div>
  );
};