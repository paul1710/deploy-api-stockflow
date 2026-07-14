const { Cliente, Venta } = require("../models")
const { ValidationError, NotFoundError, ConflictError } = require("../utils/errors")

const clienteController = {
  list: async (req, res, next) => {
    try {
      const clientes = await Cliente.findAll({ order: [["id", "ASC"]] })
      res.json(clientes)
    } catch (error) {
      next(error)
    }
  },

  getById: async (req, res, next) => {
    try {
      const cliente = await Cliente.findByPk(req.params.id, {
        include: [{ model: Venta, as: "ventas" }],
      })
      if (!cliente) throw new NotFoundError("Cliente no encontrado")
      res.json(cliente)
    } catch (error) {
      next(error)
    }
  },

  create: async (req, res, next) => {
    try {
      const { identificacion, nombres, apellidos, email, telefono, direccion } = req.body

      if (!identificacion || !nombres || !apellidos || !email || !telefono || !direccion) {
        throw new ValidationError("Todos los campos son obligatorios")
      }

      const existsId = await Cliente.findOne({ where: { identificacion } })
      if (existsId) throw new ConflictError("Ya existe un cliente con esa identificacion")

      const existsEmail = await Cliente.findOne({ where: { email } })
      if (existsEmail) throw new ConflictError("Ya existe un cliente con ese email")

      const cliente = await Cliente.create({
        identificacion,
        nombres,
        apellidos,
        email,
        telefono,
        direccion,
      })
      res.status(201).json(cliente)
    } catch (error) {
      next(error)
    }
  },

  update: async (req, res, next) => {
    try {
      const cliente = await Cliente.findByPk(req.params.id)
      if (!cliente) throw new NotFoundError("Cliente no encontrado")

      const { identificacion, nombres, apellidos, email, telefono, direccion } = req.body

      if (identificacion && identificacion !== cliente.identificacion) {
        const exists = await Cliente.findOne({ where: { identificacion } })
        if (exists) throw new ConflictError("Ya existe un cliente con esa identificacion")
      }

      if (email && email !== cliente.email) {
        const exists = await Cliente.findOne({ where: { email } })
        if (exists) throw new ConflictError("Ya existe un cliente con ese email")
      }

      await cliente.update({ identificacion, nombres, apellidos, email, telefono, direccion })
      res.json(cliente)
    } catch (error) {
      next(error)
    }
  },

  remove: async (req, res, next) => {
    try {
      const cliente = await Cliente.findByPk(req.params.id)
      if (!cliente) throw new NotFoundError("Cliente no encontrado")
      await cliente.destroy()
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
}

module.exports = clienteController
