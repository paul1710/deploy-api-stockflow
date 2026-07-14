const { sequelize, Venta, DetalleVenta, Cliente, Producto } = require("../models")
const { ValidationError, NotFoundError } = require("../utils/errors")

const ventaController = {
  list: async (req, res, next) => {
    try {
      const ventas = await Venta.findAll({
        include: [
          { model: Cliente, as: "cliente" },
          { model: DetalleVenta, as: "detalles", include: [{ model: Producto, as: "producto" }] },
        ],
        order: [["id", "DESC"]],
      })
      res.json(ventas)
    } catch (error) {
      next(error)
    }
  },

  getById: async (req, res, next) => {
    try {
      const venta = await Venta.findByPk(req.params.id, {
        include: [
          { model: Cliente, as: "cliente" },
          { model: DetalleVenta, as: "detalles", include: [{ model: Producto, as: "producto" }] },
        ],
      })
      if (!venta) throw new NotFoundError("Venta no encontrada")
      res.json(venta)
    } catch (error) {
      next(error)
    }
  },

  create: async (req, res, next) => {
    const t = await sequelize.transaction()
    try {
      const { clienteId, detalles } = req.body

      if (!clienteId) throw new ValidationError("clienteId es obligatorio")
      if (!Array.isArray(detalles) || detalles.length === 0) {
        throw new ValidationError("Debe incluir al menos un detalle")
      }

      const cliente = await Cliente.findByPk(clienteId, { transaction: t })
      if (!cliente) throw new NotFoundError("Cliente no encontrado")

      let total = 0
      const detallesData = []

      for (const item of detalles) {
        const { productoId, cantidad } = item
        if (!productoId || !cantidad) {
          throw new ValidationError("Cada detalle requiere productoId y cantidad")
        }
        if (Number(cantidad) <= 0) {
          throw new ValidationError("La cantidad debe ser mayor a cero")
        }

        const producto = await Producto.findByPk(productoId, { transaction: t })
        if (!producto) throw new NotFoundError(`Producto ${productoId} no encontrado`)
        if (producto.stock < cantidad) {
          throw new ValidationError(`Stock insuficiente para el producto ${producto.nombre}`)
        }

        const precioUnitario = Number(producto.precio)
        const subtotal = precioUnitario * Number(cantidad)
        total += subtotal

        detallesData.push({
          productoId,
          cantidad,
          precioUnitario,
          subtotal,
          producto,
        })
      }

      const venta = await Venta.create({ clienteId, total }, { transaction: t })

      for (const d of detallesData) {
        await DetalleVenta.create(
          {
            ventaId: venta.id,
            productoId: d.productoId,
            cantidad: d.cantidad,
            precioUnitario: d.precioUnitario,
            subtotal: d.subtotal,
          },
          { transaction: t }
        )
        await d.producto.update({ stock: d.producto.stock - d.cantidad }, { transaction: t })
      }

      await t.commit()

      const ventaCompleta = await Venta.findByPk(venta.id, {
        include: [
          { model: Cliente, as: "cliente" },
          { model: DetalleVenta, as: "detalles", include: [{ model: Producto, as: "producto" }] },
        ],
      })

      res.status(201).json(ventaCompleta)
    } catch (error) {
      await t.rollback()
      next(error)
    }
  },

  remove: async (req, res, next) => {
    const t = await sequelize.transaction()
    try {
      const venta = await Venta.findByPk(req.params.id, {
        include: [{ model: DetalleVenta, as: "detalles" }],
        transaction: t,
      })
      if (!venta) throw new NotFoundError("Venta no encontrada")

      for (const detalle of venta.detalles) {
        const producto = await Producto.findByPk(detalle.productoId, { transaction: t })
        if (producto) {
          await producto.update({ stock: producto.stock + detalle.cantidad }, { transaction: t })
        }
      }

      await venta.destroy({ transaction: t })
      await t.commit()
      res.status(204).send()
    } catch (error) {
      await t.rollback()
      next(error)
    }
  },
}

module.exports = ventaController
