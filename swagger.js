// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Book Manager API',
      version: '1.0.0',
      description: 'API quản lý sách trong thư viện',
    },
  },
  apis: ['./index.js'], // File chứa định nghĩa API bằng comment
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
