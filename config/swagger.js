const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Herramientas Node API",
    version: "1.0.0",
    description:
      "API REST para gestion de tienda (categorias, clientes, productos y ventas) con autenticacion JWT.",
  },
  servers: [{ url: "/", description: "Servidor actual" }],
  tags: [
    { name: "Auth", description: "Autenticacion y usuarios" },
    { name: "Categorias" },
    { name: "Clientes" },
    { name: "Productos" },
    { name: "Ventas" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          message: { type: "string" },
          errors: { type: "array", items: { type: "string" } },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          email: { type: "string", format: "email" },
          rol: { type: "string", enum: ["admin", "user"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
        },
      },
      RegisterInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 },
          rol: { type: "string", enum: ["admin", "user"], default: "user" },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      RefreshInput: {
        type: "object",
        required: ["refreshToken"],
        properties: { refreshToken: { type: "string" } },
      },
      Categoria: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nombre: { type: "string" },
          descripcion: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CategoriaInput: {
        type: "object",
        required: ["nombre"],
        properties: {
          nombre: { type: "string" },
          descripcion: { type: "string" },
        },
      },
      Cliente: {
        type: "object",
        properties: {
          id: { type: "integer" },
          identificacion: { type: "string" },
          nombres: { type: "string" },
          apellidos: { type: "string" },
          email: { type: "string", format: "email" },
          telefono: { type: "string" },
          direccion: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ClienteInput: {
        type: "object",
        required: ["identificacion", "nombres", "apellidos", "email", "telefono", "direccion"],
        properties: {
          identificacion: { type: "string" },
          nombres: { type: "string" },
          apellidos: { type: "string" },
          email: { type: "string", format: "email" },
          telefono: { type: "string" },
          direccion: { type: "string" },
        },
      },
      Producto: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nombre: { type: "string" },
          descripcion: { type: "string", nullable: true },
          precio: { type: "number", format: "float" },
          stock: { type: "integer" },
          categoriaId: { type: "integer", nullable: true },
          categoria: { $ref: "#/components/schemas/Categoria" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProductoInput: {
        type: "object",
        required: ["nombre", "precio"],
        properties: {
          nombre: { type: "string" },
          descripcion: { type: "string" },
          precio: { type: "number", format: "float", minimum: 0 },
          stock: { type: "integer", minimum: 0, default: 0 },
          categoriaId: { type: "integer" },
        },
      },
      DetalleVenta: {
        type: "object",
        properties: {
          id: { type: "integer" },
          ventaId: { type: "integer" },
          productoId: { type: "integer" },
          cantidad: { type: "integer" },
          precioUnitario: { type: "number", format: "float" },
          subtotal: { type: "number", format: "float" },
          producto: { $ref: "#/components/schemas/Producto" },
        },
      },
      Venta: {
        type: "object",
        properties: {
          id: { type: "integer" },
          fecha: { type: "string", format: "date-time" },
          total: { type: "number", format: "float" },
          clienteId: { type: "integer" },
          cliente: { $ref: "#/components/schemas/Cliente" },
          detalles: { type: "array", items: { $ref: "#/components/schemas/DetalleVenta" } },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      VentaInput: {
        type: "object",
        required: ["clienteId", "detalles"],
        properties: {
          clienteId: { type: "integer" },
          detalles: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              required: ["productoId", "cantidad"],
              properties: {
                productoId: { type: "integer" },
                cantidad: { type: "integer", minimum: 1 },
              },
            },
          },
        },
      },
    },
    responses: {
      BadRequest: {
        description: "Datos invalidos",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
      Unauthorized: {
        description: "No autorizado",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
      NotFound: {
        description: "Recurso no encontrado",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
      Conflict: {
        description: "Conflicto",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar nuevo usuario",
        security: [],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterInput" } } },
        },
        responses: {
          201: {
            description: "Usuario creado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
          },
          400: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Iniciar sesion",
        security: [],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } } },
        },
        responses: {
          200: {
            description: "Login exitoso",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Renovar accessToken",
        security: [],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RefreshInput" } } },
        },
        responses: {
          200: {
            description: "Tokens renovados",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: { type: "string" },
                    refreshToken: { type: "string" },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Usuario autenticado",
        responses: {
          200: {
            description: "Usuario actual",
            content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },

    "/api/categorias": {
      get: {
        tags: ["Categorias"],
        summary: "Listar categorias",
        responses: {
          200: {
            description: "Lista de categorias",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Categoria" } },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        tags: ["Categorias"],
        summary: "Crear categoria",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CategoriaInput" } } },
        },
        responses: {
          201: {
            description: "Categoria creada",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Categoria" } } },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          409: { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/api/categorias/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      get: {
        tags: ["Categorias"],
        summary: "Obtener categoria por id",
        responses: {
          200: {
            description: "Categoria",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Categoria" } } },
          },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      put: {
        tags: ["Categorias"],
        summary: "Actualizar categoria",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CategoriaInput" } } },
        },
        responses: {
          200: {
            description: "Categoria actualizada",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Categoria" } } },
          },
          404: { $ref: "#/components/responses/NotFound" },
          409: { $ref: "#/components/responses/Conflict" },
        },
      },
      delete: {
        tags: ["Categorias"],
        summary: "Eliminar categoria",
        responses: {
          204: { description: "Eliminada" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },

    "/api/clientes": {
      get: {
        tags: ["Clientes"],
        summary: "Listar clientes",
        responses: {
          200: {
            description: "Lista de clientes",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Cliente" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Clientes"],
        summary: "Crear cliente",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ClienteInput" } } },
        },
        responses: {
          201: {
            description: "Cliente creado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Cliente" } } },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          409: { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/api/clientes/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      get: {
        tags: ["Clientes"],
        summary: "Obtener cliente por id",
        responses: {
          200: {
            description: "Cliente",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Cliente" } } },
          },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      put: {
        tags: ["Clientes"],
        summary: "Actualizar cliente",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ClienteInput" } } },
        },
        responses: {
          200: {
            description: "Cliente actualizado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Cliente" } } },
          },
          404: { $ref: "#/components/responses/NotFound" },
          409: { $ref: "#/components/responses/Conflict" },
        },
      },
      delete: {
        tags: ["Clientes"],
        summary: "Eliminar cliente",
        responses: {
          204: { description: "Eliminado" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },

    "/api/productos": {
      get: {
        tags: ["Productos"],
        summary: "Listar productos",
        responses: {
          200: {
            description: "Lista de productos",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Producto" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Productos"],
        summary: "Crear producto",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProductoInput" } } },
        },
        responses: {
          201: {
            description: "Producto creado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Producto" } } },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          404: { $ref: "#/components/responses/NotFound" },
          409: { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/api/productos/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      get: {
        tags: ["Productos"],
        summary: "Obtener producto por id",
        responses: {
          200: {
            description: "Producto",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Producto" } } },
          },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      put: {
        tags: ["Productos"],
        summary: "Actualizar producto",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProductoInput" } } },
        },
        responses: {
          200: {
            description: "Producto actualizado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Producto" } } },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          404: { $ref: "#/components/responses/NotFound" },
          409: { $ref: "#/components/responses/Conflict" },
        },
      },
      delete: {
        tags: ["Productos"],
        summary: "Eliminar producto",
        responses: {
          204: { description: "Eliminado" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },

    "/api/ventas": {
      get: {
        tags: ["Ventas"],
        summary: "Listar ventas",
        responses: {
          200: {
            description: "Lista de ventas",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Venta" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Ventas"],
        summary: "Crear venta (transaccional, descuenta stock)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/VentaInput" } } },
        },
        responses: {
          201: {
            description: "Venta creada",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Venta" } } },
          },
          400: { $ref: "#/components/responses/BadRequest" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/ventas/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      get: {
        tags: ["Ventas"],
        summary: "Obtener venta por id",
        responses: {
          200: {
            description: "Venta",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Venta" } } },
          },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Ventas"],
        summary: "Eliminar venta (reintegra stock)",
        responses: {
          204: { description: "Eliminada" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
  },
}

module.exports = swaggerSpec
