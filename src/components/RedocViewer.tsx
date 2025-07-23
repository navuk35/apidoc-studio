import React, { useEffect, useRef } from 'react';
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
  const redocInitialized = useRef(false);

  useEffect(() => {
    if (!spec || !containerRef.current) return;

    // Load Redoc script if not already loaded
    const loadRedoc = async () => {
      if (!window.Redoc) {
        const script = document.createElement('script');
        script.src = 'https://cdn.redoc.ly/redoc/2.1.3/bundles/redoc.standalone.js';
        script.async = true;
        document.head.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }
      
      // Initialize Redoc
      if (window.Redoc && containerRef.current) {
        try {
          // Clear container
          containerRef.current.innerHTML = '';
          
          // Redoc options for dark theme and professional styling
          const options = {
            theme: {
              colors: {
                primary: {
                  main: 'hsl(217, 91%, 60%)'
                },
                success: {
                  main: 'hsl(142, 76%, 45%)'
                },
                warning: {
                  main: 'hsl(47, 100%, 62%)'
                },
                error: {
                  main: 'hsl(0, 84%, 60%)'
                },
                text: {
                  primary: 'hsl(220, 9%, 92%)',
                  secondary: 'hsl(220, 9%, 65%)'
                }
              },
              sidebar: {
                backgroundColor: 'hsl(220, 13%, 8%)',
                textColor: 'hsl(220, 9%, 85%)',
                activeTextColor: 'hsl(217, 91%, 60%)',
                groupItems: {
                  activeBackgroundColor: 'hsl(220, 13%, 12%)',
                  activeTextColor: 'hsl(217, 91%, 60%)',
                  textTransform: 'none'
                },
                level1Items: {
                  activeBackgroundColor: 'hsl(220, 13%, 12%)',
                  activeTextColor: 'hsl(217, 91%, 60%)',
                  textTransform: 'none'
                },
                arrow: {
                  color: 'hsl(220, 9%, 65%)'
                }
              },
              rightPanel: {
                backgroundColor: 'hsl(220, 13%, 6%)',
                textColor: 'hsl(220, 9%, 92%)'
              },
              codeBlock: {
                backgroundColor: 'hsl(220, 13%, 6%)'
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
            unstable_externalDescription: false,
            hideHostname: false,
            hideLoading: false,
            nativeScrollbars: false,
            pathInMiddlePanel: false,
            untrustedSpec: false,
            suppressWarnings: false,
            hideSchemaPattern: false,
            expandDefaultServerVariables: false,
            maxDisplayedEnumValues: 5
          };

          // Initialize Redoc
          window.Redoc.init(spec, options, containerRef.current, () => {
            redocInitialized.current = true;
          });
        } catch (error) {
          console.error('Failed to initialize Redoc:', error);
          if (containerRef.current) {
            containerRef.current.innerHTML = `
              <div style="padding: 2rem; text-align: center; color: hsl(0, 84%, 60%);">
                <h3>Failed to render documentation</h3>
                <p style="margin-top: 1rem; color: hsl(220, 9%, 65%);">
                  ${error instanceof Error ? error.message : 'Unknown error occurred'}
                </p>
              </div>
            `;
          }
        }
      }
    };

    loadRedoc();

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      redocInitialized.current = false;
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

  return (
    <div className="h-full">
      <div 
        ref={containerRef} 
        className="h-full w-full"
        style={{ 
          backgroundColor: 'hsl(220, 13%, 7%)',
          color: 'hsl(220, 9%, 92%)'
        }} 
      />
    </div>
  );
};