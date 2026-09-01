/**
 * src/lib/swagger.ts
 * Swagger configuration helpers.
 */

import { swaggerConfig } from "../../docs/swagger.config";
import { OPENAPI_SPEC_PATH } from "./openapi";

export function getSwaggerConfig() {
  return swaggerConfig;
}

export function getOpenApiSpecPath() {
  return OPENAPI_SPEC_PATH;
}
