import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from './FileUpload';
import { YamlEditor } from './YamlEditor';
import { TryItConsole } from './TryItConsole';
import { RedocViewer } from './RedocViewer';
import { Upload, FileText, Play, Settings } from 'lucide-react';

interface ApiDocViewerProps {}

export const ApiDocViewer: React.FC<ApiDocViewerProps> = () => {
  const [spec, setSpec] = useState<string>('');
  const [parsedSpec, setParsedSpec] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('upload');

  const handleSpecLoad = useCallback((newSpec: string, parsed: any) => {
    setSpec(newSpec);
    setParsedSpec(parsed);
    setActiveTab('viewer');
  }, []);

  const handleSpecChange = useCallback((newSpec: string, parsed: any) => {
    setSpec(newSpec);
    setParsedSpec(parsed);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">OpenAPI Studio</h1>
                <p className="text-sm text-muted-foreground">Professional API Documentation Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar Navigation */}
        <div className="w-64 border-r border-border bg-card/30 p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
            <TabsList className="grid w-full grid-cols-1 gap-2 h-auto bg-transparent p-0">
              <TabsTrigger 
                value="upload" 
                className="w-full justify-start gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Upload className="h-4 w-4" />
                Load Spec
              </TabsTrigger>
              <TabsTrigger 
                value="viewer" 
                className="w-full justify-start gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                disabled={!parsedSpec}
              >
                <FileText className="h-4 w-4" />
                Documentation
              </TabsTrigger>
              <TabsTrigger 
                value="editor" 
                className="w-full justify-start gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                disabled={!spec}
              >
                <FileText className="h-4 w-4" />
                Editor
              </TabsTrigger>
              <TabsTrigger 
                value="tryit" 
                className="w-full justify-start gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                disabled={!parsedSpec}
              >
                <Play className="h-4 w-4" />
                Try It
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <div className="flex-1 mt-6">
              <TabsContent value="upload" className="m-0 h-full">
                <Card className="h-full">
                  <FileUpload onSpecLoad={handleSpecLoad} />
                </Card>
              </TabsContent>

              <TabsContent value="viewer" className="m-0 h-full">
                <Card className="h-full">
                  <RedocViewer spec={parsedSpec} />
                </Card>
              </TabsContent>

              <TabsContent value="editor" className="m-0 h-full">
                <Card className="h-full">
                  <YamlEditor 
                    value={spec} 
                    onChange={handleSpecChange}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="tryit" className="m-0 h-full">
                <Card className="h-full">
                  <TryItConsole spec={parsedSpec} />
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-background">
          <Tabs value={activeTab} className="h-full">
            <TabsContent value="upload" className="m-0 h-full p-6">
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4 max-w-md">
                  <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
                    <Upload className="h-12 w-12 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Get Started</h2>
                  <p className="text-muted-foreground">
                    Upload your OpenAPI specification file or paste a URL to begin viewing and editing your API documentation.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="viewer" className="m-0 h-full">
              <RedocViewer spec={parsedSpec} />
            </TabsContent>

            <TabsContent value="editor" className="m-0 h-full">
              <div className="grid grid-cols-2 h-full">
                <div className="border-r border-border">
                  <YamlEditor 
                    value={spec} 
                    onChange={handleSpecChange}
                  />
                </div>
                <div>
                  <RedocViewer spec={parsedSpec} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tryit" className="m-0 h-full">
              <TryItConsole spec={parsedSpec} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};