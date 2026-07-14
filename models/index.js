const sequelize = require("../config/db")

const User = require("./user")
const Categoria = require("./categoria")
const Cliente = require("./cliente")
const Producto = require("./producto")
const Venta = require("./venta")
const DetalleVenta = require("./detalleventa")

Categoria.hasMany(Producto, { foreignKey: "categoriaId", as: "productos", onDelete: "RESTRICT" })
Producto.belongsTo(Categoria, { foreignKey: "categoriaId", as: "categoria" })

Cliente.hasMany(Venta, { foreignKey: "clienteId", as: "ventas", onDelete: "RESTRICT" })
Venta.belongsTo(Cliente, { foreignKey: "clienteId", as: "cliente" })

Venta.hasMany(DetalleVenta, { foreignKey: "ventaId", as: "detalles", onDelete: "CASCADE" })
DetalleVenta.belongsTo(Venta, { foreignKey: "ventaId", as: "venta" })

Producto.hasMany(DetalleVenta, { foreignKey: "productoId", as: "detalles", onDelete: "RESTRICT" })
DetalleVenta.belongsTo(Producto, { foreignKey: "productoId", as: "producto" })

module.exports = {
  sequelize,
  User,
  Categoria,
  Cliente,
  Producto,
  Venta,
  DetalleVenta,
}
