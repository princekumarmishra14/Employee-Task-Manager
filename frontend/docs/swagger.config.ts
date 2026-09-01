/**
 * docs/swagger.config.ts
 * Configures central constants for the ETM OpenAPI Swagger implementation.
 */

export const swaggerConfig = {
  title: "Employee Task Manager API",
  version: "1.0.0",
  buildVersion: "1.0.0-release.1",
  companyName: "Employee Task Manager",
  openapiPath: "/docs/openapi.json",
  contact: {
    name: "ETM Engineering Support",
    email: "engineering@etm-enterprise.com",
    url: "https://etm-enterprise.com"
  },
  license: {
    name: "Commercial License",
    url: "https://etm-enterprise.com/license"
  }
};
