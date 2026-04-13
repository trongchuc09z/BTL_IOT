const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IoT Backend API",
      version: "1.0.0",
      description: "API tai lieu cho he thong IoT backend.",
    },
    servers: [
      {
        url: "http://localhost:9999",
      },
    ],
  },
  apis: [path.join(__dirname, "router", "*.js")],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
