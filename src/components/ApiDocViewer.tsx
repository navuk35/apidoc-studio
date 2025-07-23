import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from '@/components/ui/drawer';
import { FileUpload } from './FileUpload';
import { YamlEditor } from './YamlEditor';
import { TryItConsole } from './TryItConsole';
import { RedocViewer } from './RedocViewer';
import { Upload, FileText, Play, Settings, Sun, Moon, Menu } from 'lucide-react';

interface ApiDocViewerProps {}

export const ApiDocViewer: React.FC<ApiDocViewerProps> = () => {
  const [spec, setSpec] = useState<string>('');
  const [parsedSpec, setParsedSpec] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [menuVisibility, setMenuVisibility] = useState({
    loadSpec: true,
    documentation: true,
    editor: true,
    tryIt: true,
  });

  // Load default sample spec on component mount
  React.useEffect(() => {
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
    setSpec(yamlContent);
    setParsedSpec(defaultSpec);
    setActiveTab('viewer');
  }, []);

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
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold">Navigation Menu</h3>
                    <div className="grid gap-2">
                      {menuVisibility.loadSpec && (
                        <DrawerClose asChild>
                          <Button
                            variant="ghost"
                            onClick={() => setActiveTab('upload')}
                            className="justify-start gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            Load Spec
                          </Button>
                        </DrawerClose>
                      )}
                      {menuVisibility.documentation && (
                        <DrawerClose asChild>
                          <Button
                            variant="ghost"
                            onClick={() => setActiveTab('viewer')}
                            disabled={!parsedSpec}
                            className="justify-start gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            Documentation
                          </Button>
                        </DrawerClose>
                      )}
                      {menuVisibility.editor && (
                        <DrawerClose asChild>
                          <Button
                            variant="ghost"
                            onClick={() => setActiveTab('editor')}
                            disabled={!spec}
                            className="justify-start gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            Editor
                          </Button>
                        </DrawerClose>
                      )}
                      {menuVisibility.tryIt && (
                        <DrawerClose asChild>
                          <Button
                            variant="ghost"
                            onClick={() => setActiveTab('tryit')}
                            disabled={!parsedSpec}
                            className="justify-start gap-2"
                          >
                            <Play className="h-4 w-4" />
                            Try It
                          </Button>
                        </DrawerClose>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-2">Menu Visibility</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="show-load-spec"
                            checked={menuVisibility.loadSpec}
                            onCheckedChange={(checked) =>
                              setMenuVisibility(prev => ({ ...prev, loadSpec: checked }))
                            }
                          />
                          <Label htmlFor="show-load-spec" className="text-xs">Load Spec</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="show-documentation"
                            checked={menuVisibility.documentation}
                            onCheckedChange={(checked) =>
                              setMenuVisibility(prev => ({ ...prev, documentation: checked }))
                            }
                          />
                          <Label htmlFor="show-documentation" className="text-xs">Documentation</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="show-editor"
                            checked={menuVisibility.editor}
                            onCheckedChange={(checked) =>
                              setMenuVisibility(prev => ({ ...prev, editor: checked }))
                            }
                          />
                          <Label htmlFor="show-editor" className="text-xs">Editor</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="show-try-it"
                            checked={menuVisibility.tryIt}
                            onCheckedChange={(checked) =>
                              setMenuVisibility(prev => ({ ...prev, tryIt: checked }))
                            }
                          />
                          <Label htmlFor="show-try-it" className="text-xs">Try It</Label>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-3">
                        <Switch 
                          id="theme-toggle" 
                          checked={theme === 'light'} 
                          onCheckedChange={(checked) => setTheme(checked ? 'light' : 'dark')}
                        />
                        <Label htmlFor="theme-toggle" className="flex items-center gap-2 text-xs font-medium">
                          {theme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                          {theme === 'light' ? 'Light' : 'Dark'} Theme
                        </Label>
                      </div>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="h-[calc(100vh-80px)] bg-background">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="upload" className="m-0 h-full">
            <Card className="h-full">
              <FileUpload onSpecLoad={handleSpecLoad} />
            </Card>
          </TabsContent>

          <TabsContent value="viewer" className="m-0 h-full">
            <div className="h-full mx-4 my-4">
              <RedocViewer 
                spec={parsedSpec} 
                theme={theme}
              />
            </div>
          </TabsContent>

          <TabsContent value="editor" className="m-0 h-full">
            <div className="grid grid-cols-2 h-full">
              <div className="border-r border-border">
                <YamlEditor 
                  value={spec} 
                  onChange={handleSpecChange}
                />
              </div>
              <div className="relative">
                <RedocViewer 
                  spec={parsedSpec} 
                  theme={theme}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tryit" className="m-0 h-full">
            <TryItConsole spec={parsedSpec} theme={theme} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};