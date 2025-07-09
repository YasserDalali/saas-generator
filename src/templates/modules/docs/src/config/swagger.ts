import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SaaS API",
      version: "1.0.0",
      description: "A comprehensive SaaS application API documentation",
      contact: {
        name: "API Support",
        email: "support@example.com",
        url: "https://example.com/support"
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT"
      }
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.example.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token"
        },
        apiKey: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description: "API key for authentication"
        }
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false
            },
            message: {
              type: "string",
              example: "Error message"
            },
            code: {
              type: "string",
              example: "ERROR_CODE"
            }
          }
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "60f7b1b3b3b3b3b3b3b3b3b3"
            },
            email: {
              type: "string",
              format: "email",
              example: "user@example.com"
            },
            name: {
              type: "string",
              example: "John Doe"
            },
            createdAt: {
              type: "string",
              format: "date-time"
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ["./src/routes/*.ts", "./src/routes/*.js"], // Path to the API files
};

const specs = swaggerJsdoc(options);

// Custom CSS for better styling
const customCss = `
  .swagger-ui .topbar { display: none; }
  .swagger-ui .info .title { color: #3b82f6; }
  .swagger-ui .scheme-container { background: #f8fafc; padding: 15px; border-radius: 8px; }
`;

// Swagger UI options with enhanced features
const swaggerUiOptions = {
  customCss,
  customSiteTitle: "SaaS API Documentation",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: "none",
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    requestInterceptor: (req: any) => {
      // Add custom headers or modify requests
      req.headers["X-Requested-With"] = "SwaggerUI";
      return req;
    }
  }
};

// Redocly alternative configuration
const redoclyOptions = {
  title: "SaaS API Documentation",
  redocOptions: {
    theme: {
      colors: {
        primary: {
          main: "#3b82f6"
        }
      },
      typography: {
        fontSize: "14px",
        lineHeight: "1.5em",
        code: {
          fontSize: "13px",
          fontFamily: "Courier, monospace"
        }
      }
    },
    hideDownloadButton: false,
    disableSearch: false,
    menuToggle: true,
    nativeScrollbars: false,
    pathInMiddlePanel: true,
    requiredPropsFirst: true,
    sortPropsAlphabetically: true,
    expandDefaultServerVariables: true,
    expandResponses: "200,201",
    showExtensions: true
  }
};

export { swaggerUi, specs, swaggerUiOptions, redoclyOptions }; 