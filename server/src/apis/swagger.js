import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import expressListRoutes from 'express-list-routes';

export const initializeSwagger = ({
  app,
  models,
  packageJson,
}) => {
  
  // Define the Swagger options
  const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0', // Specify the version of OpenAPI
      info: {
        title: packageJson.title || packageJson.name || '',
        version: packageJson.version || '',
        description: packageJson.description || '',
      },
      servers: [
        {
          url: `${process.env.SWAGGER_PROTOCOL || 'http'}://${process.env.SWAGGER_HOST || 'localhost'}:${process.env.SWAGGER_PORT || process.env.PORT || '3000'}`,
          description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
        }
      ],
    },
    apis: [], // Will be filled with API routes later
  };
  
  // Create the Swagger specification
  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  
  
  // Sample API endpoints
  const apiEndpoints = [];
  const collectionNames = new Set();
  
  // Generate Swagger paths
  const meta = app.meta;
  const paths = expressListRoutes(app, { logger: true });
  const apiPaths = {};

  paths.forEach((endpoint) => {
    endpoint.path = endpoint.path.substring(2);
    apiEndpoints.push({
      url: endpoint.path,
      method: endpoint.method,
    });
    
    // Extract collection name from URL for tagging
    const urlParts = endpoint.path.split('/');
    const collectionName = urlParts.length >= 3 && urlParts[1] === 'api' ? urlParts[2] : 'General';
    collectionNames.add(collectionName);
  });
  console.log(`Total API count: ${paths.length}`)
  
  // Create dynamic tags based on collection names
  const tags = Array.from(collectionNames).map(name => ({
    name: name,
    description: `${name} management endpoints`
  }));
  
  // Update swagger options with dynamic tags
  swaggerOptions.swaggerDefinition.tags = tags;
  
  apiEndpoints.forEach((endpoint) => {
    const { url, method, description } = endpoint;
    
    // Extract collection name from URL for tagging
    const urlParts = url.split('/');
    const collectionName = urlParts.length >= 3 && urlParts[1] === 'api' ? urlParts[2] : 'General';
    
    apiPaths[url] = {
      ...paths[url],
      [method.toLowerCase()]: {
        summary: description,
        tags: [collectionName],
        responses: {
          200: {
            description: 'Successful response',
          },
          404: {
            description: 'Not found',
          },
        },
        ...meta[`${method} ${url}`],
      },
    };
  });
  
  // Add paths to Swagger documentation
  swaggerDocs.paths = { ...swaggerDocs.paths, ...apiPaths };


  const schemaTypeMapping = {
    "uuid": "string",
    "varchar": "string",
    "timestamp": "string",
  }

  for (var k in models) {
    swaggerDocs.components = swaggerDocs.components || {};
    swaggerDocs.components.schemas = swaggerDocs.components.schemas || {};

    const schema = {
      type: 'object',
      properties: {},
    };

    for (var m in models[k].tableAttributes) {
      const attribute = models[k].tableAttributes[m];

      var type = attribute.type.__proto__.key.toLowerCase();
      var description = attribute.description || '';

      if (type === 'enum') {
        type = "string";
        description = `${description}<br/>${JSON.stringify(attribute.type.values)}`.trim();
      }

      var defaultValue = attribute.defaultValue?.toString() || "";
      var autoIncrement = attribute.autoIncrement;
      var primaryKey = attribute.primaryKey;

      if (autoIncrement) {
        continue;
      }

      if (primaryKey && defaultValue) {
        continue;
      }

      if (type.indexOf("timestamp") === 0) {
        if (defaultValue) {
          continue;
        }
      }

      for (var key in schemaTypeMapping) {
        if (type.indexOf(key) === 0) {
          type = schemaTypeMapping[key];
        }
      }

      if (type === "text") {
        type = "string";
      }

      if (type === "json" || type === "jsonb") {
        type = "string";
      }

      if (type.indexOf("double") === 0 || type.indexOf("float") === 0 || type.indexOf("decimal") === 0) {
        type = "number";
      }

      schema.properties[m] = {
        type,
        default: defaultValue,
        description,
      };
    }

    swaggerDocs.components.schemas[k] = schema;


    swaggerDocs.components.headers = {
      accesstoken: {
        description: "Access token for authorization",
      },
    }

    swaggerDocs.security = [
      {
        accesstoken: [],
      }
    ]
  }

  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  
  // Serve swagger.json
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocs);
  });
  
  console.log("Swagger URL: /api-docs");
  console.log("Swagger JSON URL: /swagger.json");
  
}



