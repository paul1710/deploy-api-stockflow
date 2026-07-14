const { Categoria, Producto } = require("../models")
const { ValidationError, NotFoundError, ConflictError } = require("../utils/errors")

const categoriaController = {
  list: async (req, res, next) => {
    try {
      const categorias = await Categoria.findAll({ order: [["id", "ASC"]] })
      res.json(categorias)
    } catch (error) {
      next(error)
    }
  },

  getById: async (req, res, next) => {
    try {
      const categoria = await Categoria.findByPk(req.params.id, {
        include: [{ model: Producto, as: "productos" }],
      })
      if (!categoria) throw new NotFoundError("Categoria no encontrada")
      res.json(categoria)
    } catch (error) {
      next(error)
    }
  },

  create: async (req, res, next) => {
    try {
      const { nombre, descripcion } = req.body
      if (!nombre) throw new ValidationError("El nombre es obligatorio")

      const exists = await Categoria.findOne({ where: { nombre } })
      if (exists) throw new ConflictError("Ya existe una categoria con ese nombre")

      const categoria = await Categoria.create({ nombre, descripcion })
      res.status(201).json(categoria)
    } catch (error) {
      next(error)
    }
  },

  update: async (req, res, next) => {
    try {
      const categoria = await Categoria.findByPk(req.params.id)
      if (!categoria) throw new NotFoundError("Categoria no encontrada")

      const { nombre, descripcion } = req.body
      if (nombre && nombre !== categoria.nombre) {
        const exists = await Categoria.findOne({ where: { nombre } })
        if (exists) throw new ConflictError("Ya existe una categoria con ese nombre")
      }

      await categoria.update({ nombre, descripcion })
      res.json(categoria)
    } catch (error) {
      next(error)
    }
  },

  remove: async (req, res, next) => {
    try {
      const categoria = await Categoria.findByPk(req.params.id)
      if (!categoria) throw new NotFoundError("Categoria no encontrada")
      await categoria.destroy()
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
}

module.exports = categoriaController
