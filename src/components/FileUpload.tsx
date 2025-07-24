import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as yaml from 'js-yaml';

interface FileUploadProps {
  onSpecLoad: (spec: string, parsed: any) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onSpecLoad }) => {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const { toast } = useToast();

  const parseSpec = useCallback((content: string) => {
    try {
      // Try parsing as JSON first
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        // If JSON parsing fails, try YAML
        parsed = yaml.load(content);
      }
      
      // Basic validation
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid specification format');
      }
      
      if (!parsed.openapi && !parsed.swagger) {
        throw new Error('Not a valid OpenAPI/Swagger specification');
      }
      
      return parsed;
    } catch (error) {
      throw new Error(`Failed to parse specification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const content = await file.text();
      const parsed = parseSpec(content);
      
      onSpecLoad(content, parsed);
      toast({
        title: "Success",
        description: `Loaded ${parsed.info?.title || 'API specification'} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to load file',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      // Reset the input
      event.target.value = '';
    }
  }, [parseSpec, onSpecLoad, toast]);

  const handleUrlLoad = useCallback(async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      const parsed = parseSpec(content);
      
      onSpecLoad(content, parsed);
      toast({
        title: "Success",
        description: `Loaded ${parsed.info?.title || 'API specification'} from URL successfully.`,
      });
      setUrl('');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to load from URL',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [url, parseSpec, onSpecLoad, toast]);


  return (
    <CardContent className="p-6 h-full">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Load OpenAPI Specification</h3>
          <p className="text-sm text-muted-foreground">
            Upload a file or load from URL
          </p>
        </div>

        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="url">From URL</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept=".yaml,.yml,.json"
                onChange={handleFileUpload}
                disabled={loading}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs text-muted-foreground">
                    Supports .yaml, .yml, and .json files
                  </p>
                </div>
              </label>
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="https://example.com/api/openapi.yaml"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
              <Button 
                onClick={handleUrlLoad}
                disabled={loading || !url.trim()}
                className="w-full"
              >
                <Link className="h-4 w-4 mr-2" />
                {loading ? 'Loading...' : 'Load from URL'}
              </Button>
            </div>
          </TabsContent>

        </Tabs>

        <div className="bg-muted/50 rounded-lg p-4 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Supported formats:</p>
              <ul className="text-muted-foreground mt-1 space-y-1">
                <li>• OpenAPI 3.0 and 3.1 (YAML or JSON)</li>
                <li>• Swagger 2.0 (YAML or JSON)</li>
                <li>• Remote URLs with CORS support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  );
};