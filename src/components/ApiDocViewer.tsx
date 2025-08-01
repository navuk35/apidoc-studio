import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import { FileUpload } from './FileUpload';
import { YamlEditor } from './YamlEditor';
import { TryItConsole } from './TryItConsole';
import { RedocViewer } from './RedocViewer';
import { OnboardingTutorial } from './OnboardingTutorial';
import { NavigationTabs } from './NavigationTabs';
import { Settings, ChevronLeft, ChevronRight, PanelRightClose, PanelRightOpen, Menu, Plus, X, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ApiSpec {
  id: string;
  name: string;
  content: string;
  parsed: any;
}

interface ApiDocViewerProps {}

export const ApiDocViewer: React.FC<ApiDocViewerProps> = () => {
  const [specs, setSpecs] = useState<ApiSpec[]>([]);
  const [selectedSpecId, setSelectedSpecId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('upload');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editorCollapsed, setEditorCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Check if user has seen onboarding before
  React.useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('apiDocViewer_hasSeenOnboarding');
    if (hasSeenOnboarding === 'true') {
      setShowOnboarding(false);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('apiDocViewer_hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('apiDocViewer_hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  // Get currently selected spec
  const currentSpec = specs.find(spec => spec.id === selectedSpecId);
  const spec = currentSpec?.content || '';
  const parsedSpec = currentSpec?.parsed || null;

  // Load default sample spec on component mount
  React.useEffect(() => {
    if (specs.length > 0) return; // Don't reload if specs already exist
    
    const defaultSpec = {
      openapi: "3.0.3",
      info: {
        title: "E-Commerce API",
        description: "A comprehensive RESTful API for an e-commerce platform featuring product management, user authentication, order processing, and payment integration.",
        version: "2.1.0",
        contact: {
          name: "API Support Team",
          email: "api-support@ecommerce.com",
          url: "https://ecommerce.com/support"
        },
        license: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT"
        }
      },
      servers: [
        {
          url: "https://api.ecommerce.com/v2",
          description: "Production server"
        },
        {
          url: "https://staging-api.ecommerce.com/v2",
          description: "Staging server"
        },
        {
          url: "http://localhost:3000/api/v2",
          description: "Development server"
        }
      ],
      paths: {
        "/products": {
          get: {
            summary: "Get all products",
            description: "Retrieve a paginated list of products with optional filtering and sorting capabilities",
            operationId: "getProducts",
            tags: ["Products"],
            parameters: [
              {
                name: "page",
                in: "query",
                description: "Page number for pagination",
                schema: { type: "integer", minimum: 1, default: 1 }
              },
              {
                name: "limit",
                in: "query", 
                description: "Number of products per page",
                schema: { type: "integer", minimum: 1, maximum: 100, default: 20 }
              },
              {
                name: "category",
                in: "query",
                description: "Filter by product category",
                schema: { type: "string" }
              },
              {
                name: "sort",
                in: "query",
                description: "Sort products by field",
                schema: { type: "string", enum: ["name", "price", "created_at", "rating"] }
              }
            ],
            responses: {
              "200": {
                description: "Successful response with product list",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        products: {
                          type: "array",
                          items: { "$ref": "#/components/schemas/Product" }
                        },
                        pagination: { "$ref": "#/components/schemas/Pagination" }
                      }
                    }
                  }
                }
              },
              "400": {
                description: "Bad request - invalid parameters",
                content: {
                  "application/json": {
                    schema: { "$ref": "#/components/schemas/Error" }
                  }
                }
              }
            }
          },
          post: {
            summary: "Create a new product",
            description: "Add a new product to the catalog (requires admin privileges)",
            operationId: "createProduct",
            tags: ["Products"],
            security: [{ "bearerAuth": [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { "$ref": "#/components/schemas/ProductCreateRequest" }
                }
              }
            },
            responses: {
              "201": {
                description: "Product created successfully",
                content: {
                  "application/json": {
                    schema: { "$ref": "#/components/schemas/Product" }
                  }
                }
              },
              "400": {
                description: "Invalid request data",
                content: {
                  "application/json": {
                    schema: { "$ref": "#/components/schemas/Error" }
                  }
                }
              },
              "401": {
                description: "Unauthorized - invalid token",
                content: {
                  "application/json": {
                    schema: { "$ref": "#/components/schemas/Error" }
                  }
                }
              },
              "403": {
                description: "Forbidden - insufficient privileges",
                content: {
                  "application/json": {
                    schema: { "$ref": "#/components/schemas/Error" }
                  }
                }
              }
            }
          }
        },
        "/products/{productId}": {
          get: {
            summary: "Get product by ID",
            description: "Retrieve detailed information about a specific product",
            operationId: "getProductById",
            tags: ["Products"],
            parameters: [
              {
                name: "productId",
                in: "path",
                required: true,
                description: "Unique identifier for the product",
                schema: { type: "string", format: "uuid" }
              }
            ],
            responses: {
              "200": {
                description: "Product details",
                content: {
                  "application/json": {
                    schema: { "$ref": "#/components/schemas/Product" }
                  }
                }
              },
              "404": {
                description: "Product not found",
                content: {
                  "application/json": {
                    schema: { "$ref": "#/components/schemas/Error" }
                  }
                }
              }
            }
          },
          put: {
            summary: "Update product",
            description: "Update an existing product (requires admin privileges)",
            operationId: "updateProduct",
            tags: ["Products"],
            security: [{ "bearerAuth": [] }],
            parameters: [
              {
                name: "productId",
                in: "path",
                required: true,
                description: "Unique identifier for the product",
                schema: { type: "string", format: "uuid" }
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { "$ref": "#/components/schemas/ProductUpdateRequest" }
                }
              }
            },
            responses: {
              "200": {
                description: "Product updated successfully",
                content: {
                  "application/json": {
                    schema: { "$ref": "#/components/schemas/Product" }
                  }
                }
              },
              "404": {
                description: "Product not found"
              },
              "401": {
                description: "Unauthorized"
              },
              "403": {
                description: "Forbidden"
              }
            }
          },
          delete: {
            summary: "Delete product",
            description: "Remove a product from the catalog (requires admin privileges)",
            operationId: "deleteProduct",
            tags: ["Products"],
            security: [{ "bearerAuth": [] }],
            parameters: [
              {
                name: "productId",
                in: "path",
                required: true,
                description: "Unique identifier for the product",
                schema: { type: "string", format: "uuid" }
              }
            ],
            responses: {
              "204": {
                description: "Product deleted successfully"
              },
              "404": {
                description: "Product not found"
              },
              "401": {
                description: "Unauthorized"
              },
              "403": {
                description: "Forbidden"
              }
            }
          }
        },
        "/auth/login": {
          post: {
            summary: "User login",
            description: "Authenticate user credentials and receive access token",
            operationId: "login",
            tags: ["Authentication"],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { "$ref": "#/components/schemas/LoginRequest" }
                }
              }
            },
            responses: {
              "200": {
                description: "Login successful",
                content: {
                  "application/json": {
                    schema: { "$ref": "#/components/schemas/AuthResponse" }
                  }
                }
              },
              "401": {
                description: "Invalid credentials",
                content: {
                  "application/json": {
                    schema: { "$ref": "#/components/schemas/Error" }
                  }
                }
              }
            }
          }
        },
        "/orders": {
          get: {
            summary: "Get user orders",
            description: "Retrieve orders for the authenticated user",
            operationId: "getUserOrders",
            tags: ["Orders"],
            security: [{ "bearerAuth": [] }],
            parameters: [
              {
                name: "status",
                in: "query",
                description: "Filter orders by status",
                schema: { 
                  type: "string", 
                  enum: ["pending", "processing", "shipped", "delivered", "cancelled"] 
                }
              }
            ],
            responses: {
              "200": {
                description: "List of user orders",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: { "$ref": "#/components/schemas/Order" }
                    }
                  }
                }
              },
              "401": {
                description: "Unauthorized"
              }
            }
          },
          post: {
            summary: "Create new order",
            description: "Place a new order for the authenticated user",
            operationId: "createOrder",
            tags: ["Orders"],
            security: [{ "bearerAuth": [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { "$ref": "#/components/schemas/OrderCreateRequest" }
                }
              }
            },
            responses: {
              "201": {
                description: "Order created successfully",
                content: {
                  "application/json": {
                    schema: { "$ref": "#/components/schemas/Order" }
                  }
                }
              },
              "400": {
                description: "Invalid order data"
              },
              "401": {
                description: "Unauthorized"
              }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        },
        schemas: {
          Product: {
            type: "object",
            required: ["id", "name", "price", "category"],
            properties: {
              id: { type: "string", format: "uuid", description: "Unique product identifier" },
              name: { type: "string", description: "Product name", example: "Wireless Bluetooth Headphones" },
              description: { type: "string", description: "Detailed product description" },
              price: { type: "number", format: "float", minimum: 0, description: "Product price in USD", example: 99.99 },
              category: { type: "string", description: "Product category", example: "Electronics" },
              sku: { type: "string", description: "Stock keeping unit", example: "WBH-001" },
              stock_quantity: { type: "integer", minimum: 0, description: "Available quantity", example: 150 },
              images: { 
                type: "array", 
                items: { type: "string", format: "uri" },
                description: "Product image URLs"
              },
              rating: { type: "number", format: "float", minimum: 0, maximum: 5, description: "Average rating" },
              created_at: { type: "string", format: "date-time" },
              updated_at: { type: "string", format: "date-time" }
            }
          },
          ProductCreateRequest: {
            type: "object",
            required: ["name", "price", "category"],
            properties: {
              name: { type: "string", minLength: 1, maxLength: 200 },
              description: { type: "string", maxLength: 1000 },
              price: { type: "number", format: "float", minimum: 0 },
              category: { type: "string", minLength: 1 },
              sku: { type: "string" },
              stock_quantity: { type: "integer", minimum: 0, default: 0 },
              images: { type: "array", items: { type: "string", format: "uri" } }
            }
          },
          ProductUpdateRequest: {
            type: "object",
            properties: {
              name: { type: "string", minLength: 1, maxLength: 200 },
              description: { type: "string", maxLength: 1000 },
              price: { type: "number", format: "float", minimum: 0 },
              category: { type: "string", minLength: 1 },
              stock_quantity: { type: "integer", minimum: 0 },
              images: { type: "array", items: { type: "string", format: "uri" } }
            }
          },
          LoginRequest: {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: { type: "string", format: "email", example: "user@example.com" },
              password: { type: "string", minLength: 6, format: "password", example: "secretpassword" }
            }
          },
          AuthResponse: {
            type: "object",
            properties: {
              access_token: { type: "string", description: "JWT access token" },
              token_type: { type: "string", example: "Bearer" },
              expires_in: { type: "integer", description: "Token expiration time in seconds", example: 3600 },
              user: { "$ref": "#/components/schemas/User" }
            }
          },
          User: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              email: { type: "string", format: "email" },
              name: { type: "string" },
              role: { type: "string", enum: ["customer", "admin"] },
              created_at: { type: "string", format: "date-time" }
            }
          },
          Order: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              user_id: { type: "string", format: "uuid" },
              status: { type: "string", enum: ["pending", "processing", "shipped", "delivered", "cancelled"] },
              total: { type: "number", format: "float", minimum: 0 },
              items: { 
                type: "array", 
                items: { "$ref": "#/components/schemas/OrderItem" }
              },
              shipping_address: { "$ref": "#/components/schemas/Address" },
              created_at: { type: "string", format: "date-time" },
              updated_at: { type: "string", format: "date-time" }
            }
          },
          OrderItem: {
            type: "object",
            properties: {
              product_id: { type: "string", format: "uuid" },
              quantity: { type: "integer", minimum: 1 },
              price: { type: "number", format: "float", minimum: 0 }
            }
          },
          OrderCreateRequest: {
            type: "object",
            required: ["items", "shipping_address"],
            properties: {
              items: { 
                type: "array", 
                items: { "$ref": "#/components/schemas/OrderItem" },
                minItems: 1
              },
              shipping_address: { "$ref": "#/components/schemas/Address" }
            }
          },
          Address: {
            type: "object",
            required: ["street", "city", "country", "postal_code"],
            properties: {
              street: { type: "string", example: "123 Main St" },
              city: { type: "string", example: "New York" },
              state: { type: "string", example: "NY" },
              country: { type: "string", example: "USA" },
              postal_code: { type: "string", example: "10001" }
            }
          },
          Pagination: {
            type: "object",
            properties: {
              page: { type: "integer", minimum: 1 },
              limit: { type: "integer", minimum: 1 },
              total: { type: "integer", minimum: 0 },
              pages: { type: "integer", minimum: 0 }
            }
          },
          Error: {
            type: "object",
            properties: {
              error: { type: "string", description: "Error message" },
              code: { type: "string", description: "Error code" },
              details: { type: "object", description: "Additional error details" }
            }
          }
        }
      },
      tags: [
        { name: "Products", description: "Product management operations" },
        { name: "Authentication", description: "User authentication endpoints" },
        { name: "Orders", description: "Order management operations" }
      ]
    };

    const yamlContent = `openapi: 3.0.3
info:
  title: E-Commerce API
  description: A comprehensive RESTful API for an e-commerce platform featuring product management, user authentication, order processing, and payment integration.
  version: 2.1.0
  contact:
    name: API Support Team
    email: api-support@ecommerce.com
    url: https://ecommerce.com/support
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.ecommerce.com/v2
    description: Production server
  - url: https://staging-api.ecommerce.com/v2
    description: Staging server
  - url: http://localhost:3000/api/v2
    description: Development server

paths:
  /products:
    get:
      summary: Get all products
      description: Retrieve a paginated list of products with optional filtering and sorting capabilities
      operationId: getProducts
      tags:
        - Products
      parameters:
        - name: page
          in: query
          description: Page number for pagination
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          description: Number of products per page
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: category
          in: query
          description: Filter by product category
          schema:
            type: string
        - name: sort
          in: query
          description: Sort products by field
          schema:
            type: string
            enum: [name, price, created_at, rating]
      responses:
        '200':
          description: Successful response with product list
          content:
            application/json:
              schema:
                type: object
                properties:
                  products:
                    type: array
                    items:
                      $ref: '#/components/schemas/Product'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
        '400':
          description: Bad request - invalid parameters
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
    post:
      summary: Create a new product
      description: Add a new product to the catalog (requires admin privileges)
      operationId: createProduct
      tags:
        - Products
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProductCreateRequest'
      responses:
        '201':
          description: Product created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
        '400':
          description: Invalid request data
        '401':
          description: Unauthorized - invalid token
        '403':
          description: Forbidden - insufficient privileges

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  
  schemas:
    Product:
      type: object
      required: [id, name, price, category]
      properties:
        id:
          type: string
          format: uuid
          description: Unique product identifier
        name:
          type: string
          description: Product name
          example: Wireless Bluetooth Headphones
        description:
          type: string
          description: Detailed product description
        price:
          type: number
          format: float
          minimum: 0
          description: Product price in USD
          example: 99.99
        category:
          type: string
          description: Product category
          example: Electronics
        sku:
          type: string
          description: Stock keeping unit
          example: WBH-001
        stock_quantity:
          type: integer
          minimum: 0
          description: Available quantity
          example: 150
        images:
          type: array
          items:
            type: string
            format: uri
          description: Product image URLs
        rating:
          type: number
          format: float
          minimum: 0
          maximum: 5
          description: Average rating
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    ProductCreateRequest:
      type: object
      required: [name, price, category]
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 200
        description:
          type: string
          maxLength: 1000
        price:
          type: number
          format: float
          minimum: 0
        category:
          type: string
          minLength: 1
        sku:
          type: string
        stock_quantity:
          type: integer
          minimum: 0
          default: 0
        images:
          type: array
          items:
            type: string
            format: uri

    Error:
      type: object
      properties:
        error:
          type: string
          description: Error message
        code:
          type: string
          description: Error code
        details:
          type: object
          description: Additional error details

tags:
  - name: Products
    description: Product management operations
  - name: Authentication
    description: User authentication endpoints
  - name: Orders
    description: Order management operations`;

    console.log('ApiDocViewer: Loading default E-Commerce API spec');
    const defaultSpecObj: ApiSpec = {
      id: 'default-ecommerce',
      name: 'E-Commerce API',
      content: yamlContent,
      parsed: defaultSpec
    };
    setSpecs([defaultSpecObj]);
    setSelectedSpecId('default-ecommerce');
    // Keep default tab as 'upload' (Load Spec)
  }, []);

  const handleSpecLoad = useCallback((newSpec: string, parsed: any) => {
    const title = parsed?.info?.title || 'Unnamed API';
    const specId = `spec-${Date.now()}`;
    const newSpecObj: ApiSpec = {
      id: specId,
      name: title,
      content: newSpec,
      parsed: parsed
    };
    setSpecs(prev => [...prev, newSpecObj]);
    setSelectedSpecId(specId);
    setActiveTab('viewer');
  }, []);

  const handleSpecChange = useCallback((newSpec: string, parsed: any) => {
    if (!selectedSpecId) return;
    setSpecs(prev => prev.map(spec => 
      spec.id === selectedSpecId 
        ? { ...spec, content: newSpec, parsed: parsed }
        : spec
    ));
  }, [selectedSpecId]);

  const handleRemoveSpec = useCallback((specId: string) => {
    setSpecs(prev => {
      const filtered = prev.filter(spec => spec.id !== specId);
      if (selectedSpecId === specId && filtered.length > 0) {
        setSelectedSpecId(filtered[0].id);
      } else if (filtered.length === 0) {
        setSelectedSpecId('');
      }
      return filtered;
    });
  }, [selectedSpecId]);

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <Card className="h-full">
            <FileUpload onSpecLoad={handleSpecLoad} />
          </Card>
        );
      
      case 'viewer':
        return (
          <div className="h-full mx-4 my-4">
            <RedocViewer 
              spec={parsedSpec} 
              theme={theme}
            />
          </div>
        );
      
      case 'editor':
        return (
          <div className="flex flex-col h-full">
            {/* Hide Editor Control - Above the editor */}
            <div className="flex items-center justify-end px-4 py-2 border-b border-border bg-card/50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditorCollapsed(!editorCollapsed)}
                className="flex items-center gap-2"
                title={editorCollapsed ? "Show Editor" : "Hide Editor"}
              >
                {editorCollapsed ? (
                  <>
                    <PanelRightOpen className="h-4 w-4" />
                    Show Editor
                  </>
                ) : (
                  <>
                    <PanelRightClose className="h-4 w-4" />
                    Hide Editor
                  </>
                )}
              </Button>
            </div>
            
            {/* Editor Content */}
            <div className="flex flex-1 overflow-hidden">
              <div className={`${editorCollapsed ? 'w-0 overflow-hidden' : 'w-1/2'} border-r border-border transition-all duration-300 ease-in-out`}>
                <YamlEditor 
                  value={spec} 
                  onChange={handleSpecChange}
                />
              </div>
              <div className={`${editorCollapsed ? 'w-full' : 'w-1/2'} transition-all duration-300 ease-in-out overflow-hidden`}>
                <RedocViewer 
                  spec={parsedSpec} 
                  theme={theme}
                />
              </div>
            </div>
          </div>
        );
      
      case 'try-it':
        return <TryItConsole spec={parsedSpec} theme={theme} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Onboarding Tutorial */}
      {showOnboarding && (
        <OnboardingTutorial 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
      
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

            {/* Settings and theme controls can go here */}
            <div className="flex items-center gap-2">
              {specs.length > 0 && (
                <Select value={selectedSpecId} onValueChange={setSelectedSpecId}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select API spec" />
                  </SelectTrigger>
                  <SelectContent>
                    {specs.map((spec) => (
                      <SelectItem key={spec.id} value={spec.id}>
                        <span className="truncate">{spec.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <NavigationTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasSpec={!!parsedSpec}
      />

      {/* Main Content */}
      <div className="h-[calc(100vh-140px)]">
        {renderContent()}
      </div>
    </div>
  );
};
