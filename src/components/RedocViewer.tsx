import React, { useEffect, useRef, useState } from 'react';
import { CardContent } from '@/components/ui/card';

interface RedocViewerProps {
  spec: any;
  theme?: 'light' | 'dark';
}

declare global {
  interface Window {
    Redoc: any;
  }
}

export const RedocViewer: React.FC<RedocViewerProps> = ({ spec, theme = 'dark' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!spec || !containerRef.current) {
      console.log('RedocViewer: No spec or container ref', { spec: !!spec, container: !!containerRef.current });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log('RedocViewer: Starting to load Redoc for spec:', spec?.info?.title || 'Unknown API');

    const loadAndRenderRedoc = async () => {
      try {
        // Check if Redoc is already loaded
        if (!window.Redoc) {
          console.log('RedocViewer: Loading Redoc script...');
          
          // Remove any existing Redoc scripts first
          const existingScripts = document.querySelectorAll('script[src*="redoc"]');
          existingScripts.forEach(script => script.remove());

          // Load Redoc script with better error handling
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js';
            script.crossOrigin = 'anonymous';
            script.async = true;
            
            script.onload = () => {
              console.log('RedocViewer: Redoc script loaded successfully');
              // Wait a bit for Redoc to initialize
              setTimeout(() => {
                if (window.Redoc) {
                  console.log('RedocViewer: Redoc object is available');
                  resolve();
                } else {
                  console.error('RedocViewer: Redoc object not available after script load');
                  reject(new Error('Redoc object not available after script load'));
                }
              }, 100);
            };
            
            script.onerror = (error) => {
              console.error('RedocViewer: Failed to load Redoc script', error);
              reject(new Error('Failed to load Redoc script from CDN'));
            };
            
            document.head.appendChild(script);
          });
        } else {
          console.log('RedocViewer: Redoc already loaded');
        }

        if (!containerRef.current) {
          console.log('RedocViewer: Container ref lost during loading');
          return;
        }

        // Clear container
        containerRef.current.innerHTML = '';

        // Create a div for Redoc
        const redocDiv = document.createElement('div');
        redocDiv.id = `redoc-container-${Date.now()}`;
        redocDiv.style.height = '100%';
        redocDiv.style.zIndex = '1';
        containerRef.current.appendChild(redocDiv);

        console.log('RedocViewer: Initializing Redoc with spec');

        // Validate spec before passing to Redoc
        if (!spec.openapi && !spec.swagger) {
          throw new Error('Invalid OpenAPI specification: missing version field');
        }

        // Initialize Redoc with simplified options and proper white text colors
        const options = {
          theme: theme === 'light' ? {
            colors: {
              primary: {
                main: '#3B82F6'
              },
              text: {
                primary: '#1F2937'
              }
            },
            sidebar: {
              backgroundColor: '#F9FAFB',
              textColor: '#374151'
            },
            rightPanel: {
              backgroundColor: '#FFFFFF',
              textColor: '#1F2937'
            }
          } : {
            colors: {
              primary: {
                main: '#3B82F6'
              },
              text: {
                primary: '#FFFFFF'
              },
              background: {
                primary: '#0F172A'
              }
            },
            sidebar: {
              backgroundColor: '#1F2937',
              textColor: '#FFFFFF'
            },
            rightPanel: {
              backgroundColor: '#0F172A',
              textColor: '#FFFFFF'
            },
            typography: {
              color: '#FFFFFF',
              headings: {
                color: '#FFFFFF'
              }
            }
          },
          scrollYOffset: 0,
          hideDownloadButton: false,
          disableSearch: false,
          expandResponses: '200,201',
          nativeScrollbars: false,
          hideNavigation: false,
          stickyNavbar: true
        };

        // Double-check Redoc is available
        if (!window.Redoc || typeof window.Redoc.init !== 'function') {
          throw new Error('Redoc.init is not available');
        }

        // Initialize Redoc
        window.Redoc.init(spec, options, redocDiv);
        console.log('RedocViewer: Redoc initialized successfully');
        setIsLoading(false);
        
      } catch (error) {
        console.error('RedocViewer: Error in loadAndRenderRedoc:', error);
        setError(error instanceof Error ? error.message : 'Failed to load documentation');
        setIsLoading(false);

        // Show a fallback simple documentation view
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="padding: 2rem; color: #F3F4F6; background: #1F2937; height: 100%; overflow-y: auto;">
              <h1 style="color: #3B82F6; margin-bottom: 1rem;">${spec?.info?.title || 'API Documentation'}</h1>
              <p style="margin-bottom: 1rem; color: #9CA3AF;">Version: ${spec?.info?.version || 'Unknown'}</p>
              <p style="margin-bottom: 2rem;">${spec?.info?.description || 'No description available'}</p>
              
              <h2 style="color: #10B981; margin-bottom: 1rem;">Endpoints</h2>
              ${Object.keys(spec?.paths || {}).map(path => `
                <div style="margin-bottom: 1rem; padding: 1rem; background: #374151; border-radius: 0.5rem;">
                  <h3 style="color: #F59E0B;">${path}</h3>
                  <div style="margin-top: 0.5rem;">
                    ${Object.keys(spec.paths[path] || {}).map(method => `
                      <span style="background: #059669; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; margin-right: 0.5rem; font-size: 0.75rem;">
                        ${method.toUpperCase()}
                      </span>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }
      }
    };

    loadAndRenderRedoc();

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [spec, theme]);

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
          <h3 className="text-lg font-semibold text-destructive">Documentation Loading Issue</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground">
            Using fallback documentation view - check browser console for details
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
          <p className="text-sm text-muted-foreground">Loading Redoc documentation...</p>
        </div>
      </CardContent>
    );
  }

  return (
    <div className={`h-full w-full relative ${theme === 'light' ? 'bg-white' : 'bg-[#0F172A]'}`}>
      <div 
        ref={containerRef} 
        className="h-full w-full relative z-0"
        style={{
          position: 'relative',
          zIndex: 1
        }}
      />
    </div>
  );
};