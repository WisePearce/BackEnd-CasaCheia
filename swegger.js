/*
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1"
*/

import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Api Casa-cheia",
      version: "1.0.0",
      description: "Documentação da API Casa-Cheia em Node.js — Backend de e-commerce",
      contact: {
        name: "Suporte Casa Cheia",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de desenvolvimento",
      },
    ],
  },

  apis: ["./app/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export  { swaggerUi, swaggerSpec };
