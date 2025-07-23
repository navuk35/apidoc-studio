import React, { useEffect, useRef, useState } from 'react';
import { CardContent } from '@/components/ui/card';

interface RedocViewerProps {
  spec: any;
}

declare global {
  interface Window {
    Redoc: any;
  }
}

export const RedocViewer: React.FC<RedocViewerProps> = ({ spec }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!spec || !containerRef.current) return;

    setIsLoading(true);
    setError(null);

    const loadAndRenderRedoc = async () => {
      try {
        // Check if Redoc is already loaded
        if (!window.Redoc) {
          // Load Redoc script
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js';
            script.crossOrigin = 'anonymous';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load Redoc script'));
            document.head.appendChild(script);
          });
        }

        if (!containerRef.current) return;

        // Clear container
        containerRef.current.innerHTML = '';

        // Create a div for Redoc
        const redocDiv = document.createElement('div');
        redocDiv.id = `redoc-container-${Date.now()}`;
        containerRef.current.appendChild(redocDiv);

        // Initialize Redoc with options
        const options = {
          theme: {
            colors: {
              primary: {
                main: '#3B82F6'
              },
              success: {
                main: '#10B981'
              },
              warning: {
                main: '#F59E0B'
              },
              error: {
                main: '#EF4444'
              },
              text: {
                primary: '#F3F4F6',
                secondary: '#9CA3AF'
              }
            },
            sidebar: {
              backgroundColor: '#1F2937',
              textColor: '#D1D5DB',
              activeTextColor: '#3B82F6',
              groupItems: {
                activeBackgroundColor: '#374151',
                activeTextColor: '#3B82F6',
                textTransform: 'none'
              },
              level1Items: {
                activeBackgroundColor: '#374151',
                activeTextColor: '#3B82F6',
                textTransform: 'none'
              },
              arrow: {
                color: '#9CA3AF'
              }
            },
            rightPanel: {
              backgroundColor: '#111827',
              textColor: '#F3F4F6'
            },
            codeBlock: {
              backgroundColor: '#111827'
            }
          },
          scrollYOffset: 0,
          hideDownloadButton: false,
          disableSearch: false,
          expandResponses: '200,201',
          jsonSampleExpandLevel: 2,
          hideSingleRequestSampleTab: true,
          showExtensions: true,
          sortPropsAlphabetically: true,
          payloadSampleIdx: 0,
          expandSingleSchemaField: true,
          schemaExpansionLevel: 2,
          showObjectSchemaExamples: true,
          nativeScrollbars: false,
          pathInMiddlePanel: false,
          untrustedSpec: false,
          suppressWarnings: false,
          hideSchemaPattern: false,
          expandDefaultServerVariables: false,
          maxDisplayedEnumValues: 5
        };

        // Initialize Redoc
        window.Redoc.init(spec, options, redocDiv);
        setIsLoading(false);
        
      } catch (error) {
        console.error('Failed to load Redoc:', error);
        setError(error instanceof Error ? error.message : 'Failed to load documentation');
        setIsLoading(false);
      }
    };

    loadAndRenderRedoc();

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [spec]);

  if (!spec) {
    return (
      <CardContent className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-muted-foreground">No specification loaded</h3>
          <p className="text-sm text-muted-foreground">
            Load an OpenAPI specification to view the documentation
          </p>
        </div>
      </CardContent>
    );
  }

  if (error) {
    return (
      <CardContent className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-destructive">Failed to load documentation</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground">
            Try refreshing the page or loading a different specification
          </p>
        </div>
      </CardContent>
    );
  }

  if (isLoading) {
    return (
      <CardContent className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading documentation...</p>
        </div>
      </CardContent>
    );
  }

  return (
    <div className="h-full w-full bg-[#0F172A]">
      <div 
        ref={containerRef} 
        className="h-full w-full"
      />
    </div>
  );
};