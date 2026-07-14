const express = require("express");
require("dotenv").config();
const swaggerUi = require("swagger-ui-express");
const { errorHandler } = require("./middleware/error-handler");
const { sequelize, Categoria, Cliente, Producto, Venta, DetalleVenta } = require("./models");
const User = require("./models/user");
const swaggerSpec = require("./config/swagger");

const app = express();
const cors = require("cors");
const allowedOrigins = (process.env.FRONTEND_URLS || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir peticiones sin origin (Postman, curl, server-to-server, etc.)
    if (!origin) return callback(null, true);
    // Permitir origins configurados en FRONTEND_URLS
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Permitir cualquier subdominio de Vercel
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Rechazar sin lanzar error — el navegador bloqueará la petición
    return callback(null, false);
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Herramientas Node API - Docs",
    swaggerOptions: { persistAuthorization: true },
  }),
);

app.get("/", (req, res) => {
  res.redirect("/api-docs");
});
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/categorias", require("./routes/categoria.routes"));
app.use("/api/clientes", require("./routes/cliente.routes"));
app.use("/api/productos", require("./routes/producto.routes"));
app.use("/api/ventas", require("./routes/venta.routes"));

app.use(errorHandler);

const createDefaultUser = async () => {
  const defaultName = process.env.DEFAULT_ADMIN_NAME || "Admin";
  const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@stockflow.com";
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";

  const existingUser = await User.findOne({ where: { email: defaultEmail } });

  if (!existingUser) {
    await User.create({
      name: defaultName,
      email: defaultEmail,
      password: defaultPassword,
      rol: "admin",
    });
    console.log(`Usuario por defecto creado: ${defaultEmail}`);
  } else {
    console.log("Usuario por defecto ya existe");
  }
};

const seedDemoData = async () => {
  const categoriaCount = await Categoria.count();
  if (categoriaCount > 0) {
    console.log("Datos demo ya existen, se omite la carga");
    return;
  }

  const categorias = await Categoria.bulkCreate([
    { nombre: "Tecnología", descripcion: "Dispositivos y accesorios" },
    { nombre: "Hogar", descripcion: "Productos para el hogar" },
    { nombre: "Moda", descripcion: "Ropa y accesorios" },
  ]);

  const clientes = await Cliente.bulkCreate([
    { identificacion: "1001", nombres: "Ana", apellidos: "García", email: "ana@example.com", telefono: "3001111111", direccion: "Calle 1 #10-20" },
    { identificacion: "1002", nombres: "Luis", apellidos: "Pérez", email: "luis@example.com", telefono: "3002222222", direccion: "Carrera 5 #15-30" },
    { identificacion: "1003", nombres: "María", apellidos: "Rodríguez", email: "maria@example.com", telefono: "3003333333", direccion: "Avenida 7 #25-40" },
  ]);

  const productos = await Producto.bulkCreate([
    { nombre: "Laptop Pro", descripcion: "Laptop de alto rendimiento", precio: 1299000, stock: 12, categoriaId: categorias[0].id },
    { nombre: "Mouse Inalámbrico", descripcion: "Mouse ergonómico", precio: 180000, stock: 40, categoriaId: categorias[0].id },
    { nombre: "Silla Ergonómica", descripcion: "Silla para oficina", precio: 650000, stock: 8, categoriaId: categorias[1].id },
    { nombre: "Camiseta Básica", descripcion: "Camiseta de algodón", precio: 55000, stock: 24, categoriaId: categorias[2].id },
  ]);

  const venta1 = await Venta.create({ clienteId: clientes[0].id, total: 1479000 });
  await DetalleVenta.bulkCreate([
    { ventaId: venta1.id, productoId: productos[0].id, cantidad: 1, precioUnitario: 1299000, subtotal: 1299000 },
    { ventaId: venta1.id, productoId: productos[1].id, cantidad: 1, precioUnitario: 180000, subtotal: 180000 },
  ]);

  const venta2 = await Venta.create({ clienteId: clientes[1].id, total: 705000 });
  await DetalleVenta.bulkCreate([
    { ventaId: venta2.id, productoId: productos[2].id, cantidad: 1, precioUnitario: 650000, subtotal: 650000 },
    { ventaId: venta2.id, productoId: productos[3].id, cantidad: 1, precioUnitario: 55000, subtotal: 55000 },
  ]);

  console.log("Datos demo cargados: 3 clientes, 4 productos y 2 ventas");
};

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a BD establecida exitosamente");

    // "force: true" limpia la base de datos y crea todo de cero sin quejas de Postgres
    await sequelize.sync();
    console.log("✅ Modelos sincronizados desde cero");

    await createDefaultUser();
    await seedDemoData();
    console.log("✅ Datos de prueba cargados con éxito");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Servidor corriendo en puerto: ${PORT}`);
    });

  } catch (error) {
    console.error("❌ ERROR CRÍTICO EN EL ARRANQUE:", error);
  }
};

start();
