/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * frontend/scripts/generate-openapi.js
 * Generates the production-grade OpenAPI 3.0.3 JSON specification for the Employee Task Manager API.
 */

const fs = require('fs');
const path = require('path');

const openapi = {
  openapi: "3.0.3",
  info: {
    title: "Employee Task Manager (ETM) API",
    description: `Enterprise-grade REST API surface area for Employee Task Manager (ETM).
This API handles complete user identity directories, dynamic RBAC permission matrices, 
department/team organization, cross-functional project tracking, tasks lifecycle auditing, 
real-time activity feeds, and security events telemetry.

### Authentication & Authorization
All secured endpoints require authentication via standard HTTP **Authorization** headers:
\`\`\`http
Authorization: Bearer <JWT>
\`\`\`
Use the **Authorize** button to pre-configure your requests.`,
    version: "1.0.0",
    contact: {
      name: "ETM Platform Development Team",
      email: "engineering@etm-enterprise.com",
      url: "https://etm-enterprise.com"
    },
    license: {
      name: "Commercial Proprietary License",
      url: "https://etm-enterprise.com/license"
    }
  },
  servers: [
    {
      url: "http://localhost:5001/api",
      description: "Local Express API Server"
    },
    {
      url: "http://localhost:3000/api",
      description: "Next.js Proxy API Gateway"
    }
  ],
  security: [
    {
      bearerAuth: []
    }
  ],
  tags: [
    { name: "Authentication", description: "User session verification, login, registration, and password recovery" },
    { name: "Employees", description: "Search, create, update, deactivate, and track employee profiles" },
    { name: "Tasks", description: "Manage project deliverables, assignees, priorities, and comment threads" },
    { name: "Departments", description: "Cluster personnel structures and create business departments" },
    { name: "Projects", description: "Configure cross-functional projects, timelines, and milestones" },
    { name: "Dashboard", description: "Retrieve high-level telemetry and aggregate dashboard analytics" },
    { name: "Roles", description: "Inspect system RBAC permission matrices and roles" },
    { name: "Audit", description: "Query security events ledger and system change audit logs" },
    { name: "Profile", description: "Retrieve active user credentials and session information" },
    { name: "Settings", description: "Configure global enterprise parameters and upload assets" }
  ],
  paths: {
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "User Authenticate & Login",
        description: "Validates email and password, returning JWT access and refresh tokens.",
        security: [], // Public endpoint
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Successfully authenticated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Login successful." },
                    data: {
                      type: "object",
                      properties: {
                        accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX..." },
                        refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX..." },
                        user: { $ref: "#/components/schemas/Profile" }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: "Missing or malformed email/password",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
          },
          401: {
            description: "Invalid email or password",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { success: false, message: "Invalid email or password." }
              }
            }
          },
          423: {
            description: "Account temporarily locked (too many failed attempts)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { success: false, message: "Your account is temporarily locked due to multiple failed login attempts. Try again in 15 minutes." }
              }
            }
          }
        }
      }
    },
    "/auth/signup": {
      post: {
        tags: ["Authentication"],
        summary: "Register New User Account",
        description: "Registers a new user identity and links it to a department and employee profile.",
        security: [], // Public endpoint
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignupRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Account registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "User registered successfully." },
                    data: {
                      type: "object",
                      properties: {
                        userId: { type: "string", format: "uuid", example: "9d01d464-672f-4dd2-b974-33c4c8ee2a73" },
                        employeeId: { type: "string", format: "uuid", example: "57659d30-f7f6-4cf7-b514-a99c8c9245c7" },
                        employeeCode: { type: "string", example: "EMP-2026-1049" }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: "Validation failed (Zod schema rejection)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: {
                  success: false,
                  message: "Validation failed.",
                  errors: {
                    email: "Invalid email address format",
                    password: "Password must be at least 8 characters."
                  }
                }
              }
            }
          },
          409: {
            description: "Email is already registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { success: false, message: "An account with this email address already exists.", errors: { email: "Email is already registered." } }
              }
            }
          }
        }
      }
    },
    "/auth/refresh": {
      post: {
        tags: ["Authentication"],
        summary: "Refresh JWT Access Token",
        description: "Exchanges a valid refresh token for a fresh short-lived access token.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: {
                  refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX..." }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Access token refreshed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX..." }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: "Refresh token is missing",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
          },
          401: {
            description: "Expired or invalid refresh token",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
          }
        }
      }
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Authentication"],
        summary: "Request Password Reset Link",
        description: "Generates a password reset token and dispatches an email via Mailtrap SMTP.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ForgotPasswordRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Reset email dispatched (or simulated successfully)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "If the account exists, a password reset link has been sent." }
                  }
                }
              }
            }
          },
          400: {
            description: "Invalid email syntax",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
          },
          429: {
            description: "Rate limit exceeded (Max 5 requests per hour)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { success: false, message: "Too many password reset requests. Please try again in an hour." }
              }
            }
          }
        }
      }
    },
    "/auth/validate-reset-token": {
      get: {
        tags: ["Authentication"],
        summary: "Validate Password Reset Token",
        description: "Checks if a password reset token is active, unused, and within the 15-minute expiration window.",
        security: [],
        parameters: [
          {
            name: "token",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "The crypto reset token sent via email"
          }
        ],
        responses: {
          200: {
            description: "Token is valid and usable",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Token is valid." }
                  }
                }
              }
            }
          },
          400: {
            description: "Token expired, locked, or invalid",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { success: false, message: "Link is invalid or has expired." }
              }
            }
          }
        }
      }
    },
    "/auth/reset-password": {
      post: {
        tags: ["Authentication"],
        summary: "Execute Password Reset",
        description: "Resets the user's password using a valid reset token.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResetPasswordRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Password reset complete",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Password updated successfully. Please login again." }
                  }
                }
              }
            }
          },
          400: {
            description: "Validation failed or passwords mismatch",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: { success: false, message: "Passwords do not match." }
              }
            }
          }
        }
      }
    },
    "/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Sign Out & Terminate Session",
        description: "Invalidates active database sessions for the token and logs the event.",
        responses: {
          200: {
            description: "Logged out successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Logged out successfully." }
                  }
                }
              }
            }
          },
          401: {
            description: "Unauthenticated request",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
          }
        }
      }
    },
    "/me": {
      get: {
        tags: ["Profile"],
        summary: "Get Authenticated Profile",
        description: "Returns details of the currently logged-in user session context.",
        responses: {
          200: {
            description: "Identity resolved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Profile" }
                  }
                }
              }
            }
          },
          401: {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
          }
        }
      }
    },
    "/roles": {
      get: {
        tags: ["Roles"],
        summary: "List System Roles",
        description: "Fetches system RBAC roles and links their assigned permissions.",
        responses: {
          200: {
            description: "Roles listed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Role" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/permissions": {
      get: {
        tags: ["Roles"],
        summary: "List System Permissions",
        description: "Fetches all system permission items in the system.",
        responses: {
          200: {
            description: "Permissions listed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Permission" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/employees": {
      get: {
        tags: ["Employees"],
        summary: "Query Employee Directory",
        description: "Fetches a paginated, filterable listing of corporate employees.",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "search", in: "query", schema: { type: "string" }, description: "Fuzzy search by name or code" },
          { name: "departmentId", in: "query", schema: { type: "string" } },
          { name: "teamId", in: "query", schema: { type: "string" } },
          { name: "isActive", in: "query", schema: { type: "boolean" } }
        ],
        responses: {
          200: {
            description: "List of employees resolved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Employee" }
                    },
                    meta: { $ref: "#/components/schemas/Pagination" }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Employees"],
        summary: "Create Employee Profile",
        description: "Registers a new employee and provisions credentials.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateEmployeeRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Employee created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Employee" }
                  }
                }
              }
            }
          },
          400: {
            description: "Validation failed",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
          },
          409: {
            description: "Email duplicate entry",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
          }
        }
      }
    },
    "/employees/{id}": {
      get: {
        tags: ["Employees"],
        summary: "Get Employee Profile details",
        description: "Resolves a detailed employee profile by ID.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        responses: {
          200: {
            description: "Profile resolved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Employee" }
                  }
                }
              }
            }
          },
          404: {
            description: "Employee not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
          }
        }
      },
      patch: {
        tags: ["Employees"],
        summary: "Update Employee details",
        description: "Modifies profile settings or active status.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateEmployeeRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Profile updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Employee" }
                  }
                }
              }
            }
          },
          404: {
            description: "Employee not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
          }
        }
      },
      delete: {
        tags: ["Employees"],
        summary: "Delete / Purge Employee profile",
        description: "Soft deletes employee profile and suspends corresponding auth credentials.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        responses: {
          200: {
            description: "Employee purged",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Employee profile deactivated successfully." }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "Query Task Board",
        description: "Fetches active and archived deliverables with status and priority filtering.",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "priority", in: "query", schema: { type: "string" } },
          { name: "assigneeId", in: "query", schema: { type: "string" } },
          { name: "departmentId", in: "query", schema: { type: "string" } },
          { name: "teamId", in: "query", schema: { type: "string" } },
          { name: "projectId", in: "query", schema: { type: "string" } }
        ],
        responses: {
          200: {
            description: "Tasks resolved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Task" }
                    },
                    meta: { $ref: "#/components/schemas/Pagination" }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Tasks"],
        summary: "Create Task",
        description: "Creates and queues a new workspace task deliverable.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTaskRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Task created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Task" }
                  }
                }
              }
            }
          },
          400: {
            description: "Validation failed (Word constraints rejected)",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
          }
        }
      }
    },
    "/tasks/{id}": {
      get: {
        tags: ["Tasks"],
        summary: "Get Task Details",
        description: "Resolves a detailed task deliverable alongside comments.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        responses: {
          200: {
            description: "Task resolved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Task" }
                  }
                }
              }
            }
          },
          404: {
            description: "Task not found",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
          }
        }
      },
      patch: {
        tags: ["Tasks"],
        summary: "Update Task",
        description: "Modifies task priority, status transitions, and description properties.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTaskRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Task updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Task" }
                  }
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete / Archive Task",
        description: "Purges task deliverable.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        responses: {
          200: {
            description: "Task deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Task deleted successfully." }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/tasks/{id}/comments": {
      post: {
        tags: ["Tasks"],
        summary: "Add Task Comment",
        description: "Appends a new discussion thread item to the specified task board.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCommentRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Comment appended",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Comment" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/departments": {
      get: {
        tags: ["Departments"],
        summary: "List Departments",
        description: "Fetches corporate departments.",
        responses: {
          200: {
            description: "Departments list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "array", items: { $ref: "#/components/schemas/Department" } }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Departments"],
        summary: "Create Department",
        description: "Creates a corporate business department.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateDepartmentRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Department created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Department" }
                  }
                }
              }
            }
          },
          409: {
            description: "Department name duplicate",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
          }
        }
      }
    },
    "/teams": {
      get: {
        tags: ["Departments"],
        summary: "List Teams",
        description: "Resolves sub-teams linked to departments.",
        responses: {
          200: {
            description: "Teams resolved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "array", items: { $ref: "#/components/schemas/Team" } }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Departments"],
        summary: "Create Team",
        description: "Adds a team under a department.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTeamRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Team created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Team" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/teams/{id}": {
      patch: {
        tags: ["Departments"],
        summary: "Update Team",
        description: "Modifies sub-team configuration properties.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTeamRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Team updated",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Team" } } } } }
          }
        }
      },
      delete: {
        tags: ["Departments"],
        summary: "Delete Team",
        description: "Soft deletes sub-team organizational block.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        responses: {
          200: {
            description: "Team deleted",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" } } } } }
          }
        }
      }
    },
    "/projects": {
      get: {
        tags: ["Projects"],
        summary: "List Corporate Projects",
        description: "Fetches active project schedules.",
        responses: {
          200: {
            description: "Projects resolved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "array", items: { $ref: "#/components/schemas/Project" } }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Projects"],
        summary: "Create Project timeline",
        description: "Provisions a new project timeline.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProjectRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Project created",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Project" } } } } }
          }
        }
      }
    },
    "/projects/{id}": {
      patch: {
        tags: ["Projects"],
        summary: "Update Project details",
        description: "Modifies active project scheduling and timeline scopes.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProjectRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Project updated",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Project" } } } } }
          }
        }
      },
      delete: {
        tags: ["Projects"],
        summary: "Delete Project timeline",
        description: "Purges project timeline schedule.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }
        ],
        responses: {
          200: {
            description: "Project deleted",
            content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" } } } } }
          }
        }
      }
    },
    "/activity": {
      get: {
        tags: ["Dashboard"],
        summary: "Get Activity Feed",
        description: "Fetches global activity feed events for live ticker dashboards.",
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } }
        ],
        responses: {
          200: {
            description: "Feed resolved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "array", items: { $ref: "#/components/schemas/Activity" } }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/audit-logs": {
      get: {
        tags: ["Audit"],
        summary: "Query Audit Log Ledger",
        description: "Queries compliance and security logs with pagination and actor queries.",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer" } },
          { name: "action", in: "query", schema: { type: "string" } },
          { name: "entity", in: "query", schema: { type: "string" } },
          { name: "entityId", in: "query", schema: { type: "string" } },
          { name: "performedBy", in: "query", schema: { type: "string" } },
          { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "to", in: "query", schema: { type: "string", format: "date-time" } }
        ],
        responses: {
          200: {
            description: "Logs list returned",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { type: "array", items: { $ref: "#/components/schemas/AuditLog" } },
                    meta: { $ref: "#/components/schemas/Pagination" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/dashboard/stats": {
      get: {
        tags: ["Dashboard"],
        summary: "Get Dashboard Statistics",
        description: "Fetches aggregate dashboard analytics, KPI counters, and productivity telemetries.",
        responses: {
          200: {
            description: "Dashboard stats resolved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: { $ref: "#/components/schemas/Analytics" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/upload": {
      post: {
        tags: ["Settings"],
        summary: "Upload Image asset",
        description: "Accepts multipart/form-data with a file payload to store in local uploads folder.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: { type: "string", format: "binary", description: "The image file asset to upload" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Asset uploaded",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    url: { type: "string", format: "uri", example: "http://localhost:5001/uploads/1782793715964-329482.png" }
                  }
                }
              }
            }
          },
          400: {
            description: "No file uploaded or invalid file format",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } }
          }
        }
      }
    },
    "/auth/session": {
      get: {
        tags: ["Authentication"],
        summary: "NextAuth session status",
        description: "Retrieves active next-auth session payload from the frontend tier.",
        security: [],
        responses: {
          200: {
            description: "Session data returned",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/Profile" },
                    expires: { type: "string", format: "date-time" }
                  }
                }
              }
            }
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
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          roleId: { type: "string", format: "uuid", nullable: true },
          departmentId: { type: "string", format: "uuid", nullable: true },
          teamId: { type: "string", format: "uuid", nullable: true },
          isActive: { type: "boolean" },
          isEmailVerified: { type: "boolean" },
          lastLoginAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Employee: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          employeeCode: { type: "string" },
          fullName: { type: "string" },
          firstName: { type: "string" },
          lastName: { type: "string" },
          title: { type: "string" },
          phone: { type: "string", nullable: true },
          avatarUrl: { type: "string", format: "uri", nullable: true },
          hireDate: { type: "string", format: "date-time" },
          bio: { type: "string", nullable: true },
          location: { type: "string", nullable: true },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Department: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          headId: { type: "string", format: "uuid", nullable: true },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Team: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          departmentId: { type: "string", format: "uuid" },
          leadId: { type: "string", format: "uuid", nullable: true },
          description: { type: "string", nullable: true },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Project: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          departmentId: { type: "string", format: "uuid", nullable: true },
          teamId: { type: "string", format: "uuid", nullable: true },
          managerId: { type: "string", format: "uuid", nullable: true },
          startDate: { type: "string", format: "date-time", nullable: true },
          endDate: { type: "string", format: "date-time", nullable: true },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Task: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string" },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "ESCALATED"] },
          status: { type: "string", enum: ["UNASSIGNED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "OVERDUE", "ARCHIVED"] },
          dueDate: { type: "string", format: "date-time" },
          startDate: { type: "string", format: "date-time" },
          completedAt: { type: "string", format: "date-time", nullable: true },
          estimatedHours: { type: "integer", nullable: true },
          tags: { type: "string", nullable: true },
          isActive: { type: "boolean" },
          assigneeId: { type: "string", format: "uuid", nullable: true },
          departmentId: { type: "string", format: "uuid", nullable: true },
          teamId: { type: "string", format: "uuid", nullable: true },
          projectId: { type: "string", format: "uuid", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Comment: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          taskId: { type: "string", format: "uuid" },
          authorId: { type: "string", format: "uuid", nullable: true },
          authorName: { type: "string" },
          content: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      AuditLog: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          action: { type: "string" },
          entity: { type: "string" },
          entityId: { type: "string" },
          entityName: { type: "string", nullable: true },
          details: { type: "string" },
          performedById: { type: "string", format: "uuid", nullable: true },
          performedBy: { type: "string" },
          ipAddress: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Activity: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          type: { type: "string" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          actorName: { type: "string" },
          actorAvatar: { type: "string", nullable: true },
          entityName: { type: "string", nullable: true },
          entityType: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Role: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          isSystem: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      Permission: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          module: { type: "string" },
          action: { type: "string" },
          description: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      Profile: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          role: { type: "string" },
          permissions: { type: "array", items: { type: "string" } },
          name: { type: "string" },
          image: { type: "string", format: "uri", nullable: true },
          title: { type: "string", nullable: true },
          employeeId: { type: "string", format: "uuid", nullable: true },
          employeeCode: { type: "string", nullable: true },
          departmentId: { type: "string", format: "uuid", nullable: true },
          teamId: { type: "string", format: "uuid", nullable: true }
        }
      },
      Analytics: {
        type: "object",
        properties: {
          employees: {
            type: "object",
            properties: {
              total: { type: "integer" },
              active: { type: "integer" },
              inactive: { type: "integer" }
            }
          },
          departments: {
            type: "object",
            properties: {
              total: { type: "integer" },
              breakdown: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    name: { type: "string" },
                    employeeCount: { type: "integer" },
                    taskCount: { type: "integer" },
                    completedTaskCount: { type: "integer" },
                    completionRate: { type: "integer" }
                  }
                }
              }
            }
          },
          teams: { type: "object", properties: { total: { type: "integer" } } },
          projects: { type: "object", properties: { total: { type: "integer" } } },
          tasks: {
            type: "object",
            properties: {
              total: { type: "integer" },
              unassigned: { type: "integer" },
              assigned: { type: "integer" },
              inProgress: { type: "integer" },
              completed: { type: "integer" },
              overdue: { type: "integer" },
              archived: { type: "integer" },
              completedToday: { type: "integer" },
              completedThisWeek: { type: "integer" },
              completedThisMonth: { type: "integer" }
            }
          },
          priorities: {
            type: "object",
            properties: {
              low: { type: "integer" },
              medium: { type: "integer" },
              high: { type: "integer" },
              escalated: { type: "integer" }
            }
          },
          analytics: {
            type: "object",
            properties: {
              overallCompletionRate: { type: "integer" }
            }
          },
          recentTasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                title: { type: "string" },
                priority: { type: "string" },
                status: { type: "string" },
                dueDate: { type: "string", format: "date-time" },
                createdAt: { type: "string", format: "date-time" },
                assigneeName: { type: "string", nullable: true },
                assigneeAvatar: { type: "string", format: "uri", nullable: true },
                departmentName: { type: "string", nullable: true },
                projectName: { type: "string", nullable: true }
              }
            }
          },
          recentActivities: {
            type: "array",
            items: { $ref: "#/components/schemas/Activity" }
          }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          errors: {
            type: "object",
            additionalProperties: { type: "string" }
          }
        }
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          pageSize: { type: "integer", example: 10 },
          total: { type: "integer", example: 120 },
          totalPages: { type: "integer", example: 12 }
        }
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "superadmin@etm.com" },
          password: { type: "string", minLength: 8, example: "SuperAdmin@123" }
        }
      },
      SignupRequest: {
        type: "object",
        required: ["firstName", "lastName", "email", "department", "designation", "password"],
        properties: {
          firstName: { type: "string", minLength: 2, example: "John" },
          lastName: { type: "string", minLength: 2, example: "Doe" },
          email: { type: "string", format: "email", example: "john.doe@enterprise.com" },
          mobile: { type: "string", example: "+1-555-9011" },
          employeeId: { type: "string", example: "EMP-Optional-ID" },
          department: { type: "string", minLength: 1, example: "Engineering" },
          designation: { type: "string", minLength: 2, example: "Software Engineer" },
          password: {
            type: "string",
            minLength: 8,
            pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\",./<>?]).{8,}$",
            description: "Must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
            example: "SecurePass@123"
          }
        }
      },
      ForgotPasswordRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email", example: "superadmin@etm.com" }
        }
      },
      ResetPasswordRequest: {
        type: "object",
        required: ["token", "password", "confirmPassword"],
        properties: {
          token: { type: "string", example: "3920db20a84c...crypto-token" },
          password: {
            type: "string",
            minLength: 8,
            pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\",./<>?]).{8,}$",
            example: "NewSecurePass@123"
          },
          confirmPassword: { type: "string", example: "NewSecurePass@123" }
        }
      },
      CreateEmployeeRequest: {
        type: "object",
        required: ["firstName", "lastName", "email", "role", "title", "departmentId"],
        properties: {
          firstName: { type: "string", minLength: 2, example: "Alice" },
          lastName: { type: "string", minLength: 2, example: "Smith" },
          email: { type: "string", format: "email", example: "alice.smith@enterprise.com" },
          phone: { type: "string", nullable: true, example: "+1-555-1200" },
          role: { type: "string", enum: ["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE", "VIEWER"], example: "EMPLOYEE" },
          title: { type: "string", example: "QA Engineer" },
          departmentId: { type: "string", format: "uuid", example: "0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d" },
          teamId: { type: "string", format: "uuid", nullable: true, example: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d" }
        }
      },
      UpdateEmployeeRequest: {
        type: "object",
        properties: {
          firstName: { type: "string", minLength: 2, example: "Alice" },
          lastName: { type: "string", minLength: 2, example: "Smith" },
          phone: { type: "string", nullable: true, example: "+1-555-1201" },
          title: { type: "string", example: "Senior QA Engineer" },
          departmentId: { type: "string", format: "uuid", example: "0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d" },
          teamId: { type: "string", format: "uuid", nullable: true, example: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d" },
          isActive: { type: "boolean", example: true }
        }
      },
      CreateTaskRequest: {
        type: "object",
        required: ["title", "description", "priority", "status", "dueDate"],
        properties: {
          title: {
            type: "string",
            description: "Task title. Minimum 3 words, maximum 8 words.",
            example: "Deploy Production Kubernetes Cluster Node"
          },
          description: {
            type: "string",
            description: "Detailed task description. Minimum 50 words, maximum 150 words.",
            example: "Configure, orchestrate, and deploy the new production Kubernetes cluster nodes on GCP compute engine instances. Ensure proper firewalls, VPC peering policies, persistent disk attachments, and container registry integrations are successfully set up and verify node health metrics and performance parameters are within specifications."
          },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "ESCALATED"], default: "MEDIUM", example: "HIGH" },
          status: { type: "string", enum: ["UNASSIGNED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "OVERDUE", "ARCHIVED"], default: "UNASSIGNED", example: "ASSIGNED" },
          dueDate: { type: "string", format: "date-time", example: "2026-07-15T18:00:00.000Z" },
          assigneeId: { type: "string", format: "uuid", nullable: true, example: "9d01d464-672f-4dd2-b974-33c4c8ee2a73" },
          departmentId: { type: "string", format: "uuid", nullable: true, example: "0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d" },
          teamId: { type: "string", format: "uuid", nullable: true, example: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d" },
          projectId: { type: "string", format: "uuid", nullable: true, example: "2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d" },
          estimatedHours: { type: "integer", nullable: true, example: 40 },
          tags: { type: "string", nullable: true, example: "infra,devops,security" }
        }
      },
      UpdateTaskRequest: {
        type: "object",
        properties: {
          title: { type: "string", example: "Deploy Production K8s Cluster" },
          description: { type: "string", example: "Configure, orchestrate, and deploy the new production Kubernetes cluster nodes on GCP compute engine instances. This task involves a comprehensive technical implementation requiring cross-functional collaboration between engineering, security, and product teams." },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "ESCALATED"], example: "ESCALATED" },
          status: { type: "string", enum: ["UNASSIGNED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "OVERDUE", "ARCHIVED"], example: "IN_PROGRESS" },
          dueDate: { type: "string", format: "date-time", example: "2026-07-20T18:00:00.000Z" },
          assigneeId: { type: "string", format: "uuid", nullable: true, example: "9d01d464-672f-4dd2-b974-33c4c8ee2a73" },
          departmentId: { type: "string", format: "uuid", nullable: true, example: "0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d" },
          teamId: { type: "string", format: "uuid", nullable: true, example: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d" },
          projectId: { type: "string", format: "uuid", nullable: true, example: "2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d" },
          estimatedHours: { type: "integer", nullable: true, example: 48 },
          tags: { type: "string", nullable: true, example: "infra,k8s,cloud" }
        }
      },
      CreateDepartmentRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Operations" },
          description: { type: "string", example: "Business operations, logistics, and process management" }
        }
      },
      CreateTeamRequest: {
        type: "object",
        required: ["name", "departmentId"],
        properties: {
          name: { type: "string", example: "Backend Team" },
          departmentId: { type: "string", format: "uuid", example: "0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d" },
          description: { type: "string", example: "API development, database architecture, and microservices" }
        }
      },
      UpdateTeamRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Core Backend API Team" },
          departmentId: { type: "string", format: "uuid", example: "0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d" },
          description: { type: "string", example: "Central API gateway and database cluster scaling" },
          isActive: { type: "boolean", example: true }
        }
      },
      CreateProjectRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Platform API v3 Redesign" },
          description: { type: "string", example: "Core API modernization rewrite project" },
          departmentId: { type: "string", format: "uuid", nullable: true, example: "0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d" },
          teamId: { type: "string", format: "uuid", nullable: true, example: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d" }
        }
      },
      UpdateProjectRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Enterprise Platform API v3 Redesign" },
          description: { type: "string", example: "Next-gen service mesh and database redesign project" },
          departmentId: { type: "string", format: "uuid", nullable: true, example: "0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d" },
          teamId: { type: "string", format: "uuid", nullable: true, example: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d" },
          isActive: { type: "boolean", example: true }
        }
      },
      CreateCommentRequest: {
        type: "object",
        required: ["content"],
        properties: {
          content: { type: "string", example: "Initial code audit completed. All parameters meet SOC2 and OWASP compliance guidelines." }
        }
      }
    }
  }
};

const outputDir = path.join(__dirname, '../docs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, 'openapi.json'), JSON.stringify(openapi, null, 2));
console.log('✅ Swagger OpenAPI 3.1.0 specification written to docs/openapi.json successfully.');
