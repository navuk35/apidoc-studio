import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Play, Copy, Trash2, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TryItConsoleProps {
  spec: any;
}

interface Parameter {
  name: string;
  value: string;
  type: 'header' | 'query' | 'path';
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  duration: number;
}

export const TryItConsole: React.FC<TryItConsoleProps> = ({ spec }) => {
  const [selectedServer, setSelectedServer] = useState('');
  const [selectedPath, setSelectedPath] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Extract servers from spec
  const servers = spec?.servers || [{ url: 'https://api.example.com' }];
  
  // Extract paths and methods
  const paths = spec?.paths || {};
  const pathsList = Object.keys(paths);
  
  const methodsList = selectedPath && paths[selectedPath] 
    ? Object.keys(paths[selectedPath]).filter(method => 
        ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(method.toLowerCase())
      )
    : [];

  const currentOperation = selectedPath && selectedMethod && paths[selectedPath]?.[selectedMethod];

  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'get': return 'bg-method-get text-white';
      case 'post': return 'bg-method-post text-white';
      case 'put': return 'bg-method-put text-white';
      case 'patch': return 'bg-method-patch text-white';
      case 'delete': return 'bg-method-delete text-white';
      default: return 'bg-muted';
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-status-success text-white';
    if (status >= 300 && status < 400) return 'bg-status-warning text-white';
    if (status >= 400) return 'bg-status-error text-white';
    return 'bg-muted';
  };

  const addParameter = useCallback((type: 'header' | 'query' | 'path') => {
    setParameters(prev => [...prev, { name: '', value: '', type }]);
  }, []);

  const updateParameter = useCallback((index: number, field: keyof Parameter, value: string) => {
    setParameters(prev => prev.map((param, i) => 
      i === index ? { ...param, [field]: value } : param
    ));
  }, []);

  const removeParameter = useCallback((index: number) => {
    setParameters(prev => prev.filter((_, i) => i !== index));
  }, []);

  const executeRequest = useCallback(async () => {
    if (!selectedServer || !selectedPath || !selectedMethod) {
      toast({
        title: "Invalid Request",
        description: "Please select server, path, and method",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const startTime = Date.now();

    try {
      // Build URL
      let url = selectedServer.replace(/\/$/, '') + selectedPath;
      
      // Replace path parameters
      const pathParams = parameters.filter(p => p.type === 'path');
      pathParams.forEach(param => {
        url = url.replace(`{${param.name}}`, encodeURIComponent(param.value));
      });

      // Add query parameters
      const queryParams = parameters.filter(p => p.type === 'query' && p.name && p.value);
      if (queryParams.length > 0) {
        const searchParams = new URLSearchParams();
        queryParams.forEach(param => searchParams.append(param.name, param.value));
        url += '?' + searchParams.toString();
      }

      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      parameters
        .filter(p => p.type === 'header' && p.name && p.value)
        .forEach(param => {
          headers[param.name] = param.value;
        });

      // Build request options
      const requestOptions: RequestInit = {
        method: selectedMethod.toUpperCase(),
        headers,
        mode: 'cors',
      };

      // Add body for methods that support it
      if (['post', 'put', 'patch'].includes(selectedMethod.toLowerCase()) && requestBody.trim()) {
        requestOptions.body = requestBody;
      }

      // Make request
      const response = await fetch(url, requestOptions);
      const duration = Date.now() - startTime;
      
      // Get response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Get response body
      const contentType = response.headers.get('content-type') || '';
      let body = '';
      
      try {
        if (contentType.includes('application/json')) {
          const json = await response.json();
          body = JSON.stringify(json, null, 2);
        } else {
          body = await response.text();
        }
      } catch (error) {
        body = 'Failed to parse response body';
      }

      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body,
        duration,
      });

      toast({
        title: "Request completed",
        description: `${response.status} ${response.statusText} in ${duration}ms`,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      setResponse({
        status: 0,
        statusText: 'Network Error',
        headers: {},
        body: error instanceof Error ? error.message : 'Unknown error occurred',
        duration,
      });

      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : 'Network error',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedServer, selectedPath, selectedMethod, parameters, requestBody, toast]);

  const copyResponse = useCallback(() => {
    if (response) {
      navigator.clipboard.writeText(response.body);
      toast({
        title: "Copied",
        description: "Response copied to clipboard",
      });
    }
  }, [response, toast]);

  const clearResponse = useCallback(() => {
    setResponse(null);
  }, []);

  if (!spec) {
    return (
      <CardContent className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-muted-foreground">No specification loaded</h3>
          <p className="text-sm text-muted-foreground">
            Load an OpenAPI specification to test the API endpoints
          </p>
        </div>
      </CardContent>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 border-b border-border">
        <CardTitle className="text-lg">API Testing Console</CardTitle>
      </CardHeader>

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-2 h-full">
          {/* Request Panel */}
          <div className="border-r border-border flex flex-col">
            <CardContent className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {/* Server Selection */}
                <div className="space-y-2">
                  <Label>Server</Label>
                  <Select value={selectedServer} onValueChange={setSelectedServer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select server" />
                    </SelectTrigger>
                    <SelectContent>
                      {servers.map((server: any, index: number) => (
                        <SelectItem key={index} value={server.url}>
                          {server.url} {server.description && `(${server.description})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Path Selection */}
                <div className="space-y-2">
                  <Label>Endpoint</Label>
                  <Select value={selectedPath} onValueChange={setSelectedPath}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select endpoint" />
                    </SelectTrigger>
                    <SelectContent>
                      {pathsList.map((path) => (
                        <SelectItem key={path} value={path}>
                          {path}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Method Selection */}
                {selectedPath && (
                  <div className="space-y-2">
                    <Label>Method</Label>
                    <div className="flex gap-2 flex-wrap">
                      {methodsList.map((method) => (
                        <Button
                          key={method}
                          variant={selectedMethod === method ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedMethod(method)}
                          className={selectedMethod === method ? getMethodColor(method) : ''}
                        >
                          {method.toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Operation Info */}
                {currentOperation && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <h4 className="font-medium">{currentOperation.summary || 'API Operation'}</h4>
                    {currentOperation.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {currentOperation.description}
                      </p>
                    )}
                  </div>
                )}

                {/* Parameters */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Parameters</Label>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => addParameter('query')}>
                        <Plus className="h-3 w-3" /> Query
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addParameter('header')}>
                        <Plus className="h-3 w-3" /> Header
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addParameter('path')}>
                        <Plus className="h-3 w-3" /> Path
                      </Button>
                    </div>
                  </div>

                  {parameters.map((param, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className="min-w-16 justify-center">
                        {param.type}
                      </Badge>
                      <Input
                        placeholder="Name"
                        value={param.name}
                        onChange={(e) => updateParameter(index, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Value"
                        value={param.value}
                        onChange={(e) => updateParameter(index, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeParameter(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Request Body */}
                {['post', 'put', 'patch'].includes(selectedMethod.toLowerCase()) && (
                  <div className="space-y-2">
                    <Label>Request Body (JSON)</Label>
                    <Textarea
                      placeholder='{"key": "value"}'
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      className="h-32 font-mono text-sm"
                    />
                  </div>
                )}

                {/* Execute Button */}
                <Button 
                  onClick={executeRequest} 
                  disabled={loading || !selectedServer || !selectedPath || !selectedMethod}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {loading ? 'Executing...' : 'Execute Request'}
                </Button>
              </div>
            </CardContent>
          </div>

          {/* Response Panel */}
          <div className="flex flex-col">
            <div className="flex-shrink-0 p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Response</h3>
                {response && (
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(response.status)}>
                      {response.status} {response.statusText}
                    </Badge>
                    <Badge variant="outline">
                      {response.duration}ms
                    </Badge>
                    <Button variant="outline" size="sm" onClick={copyResponse}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearResponse}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {response ? (
                <Tabs defaultValue="body" className="h-full flex flex-col">
                  <TabsList className="flex-shrink-0 mx-4 mt-4">
                    <TabsTrigger value="body">Response Body</TabsTrigger>
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="body" className="flex-1 m-4 mt-2 overflow-hidden">
                    <div className="h-full border rounded-lg overflow-auto">
                      <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                        {response.body}
                      </pre>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="headers" className="flex-1 m-4 mt-2 overflow-auto">
                    <div className="space-y-2">
                      {Object.entries(response.headers).map(([key, value]) => (
                        <div key={key} className="flex gap-2 text-sm">
                          <span className="font-mono font-medium min-w-32">{key}:</span>
                          <span className="font-mono text-muted-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="h-full flex items-center justify-center text-center">
                  <div className="space-y-2">
                    <Play className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Execute a request to see the response
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};