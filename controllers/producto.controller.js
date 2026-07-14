const { Producto, Categoria } = require("../models")
const { ValidationError, NotFoundError, ConflictError } = require("../utils/errors")

const productoController = {
  list: async (req, res, next) => {
    try {
      const productos = await Producto.findAll({
        include: [{ model: Categoria, as: "categoria" }],
        order: [["id", "ASC"]],
      })
      res.json(productos)
    } catch (error) {
      next(error)
    }
  },

  getById: async (req, res, next) => {
    try {
      const producto = await Producto.findByPk(req.params.id, {
        include: [{ model: Categoria, as: "categoria" }],
      })
      if (!producto) throw new NotFoundError("Producto no encontrado")
      res.json(producto)
    } catch (error) {
      next(error)
    }
  },

  create: async (req, res, next) => {
    try {
      const { nombre, descripcion, precio, stock = 0, categoriaId } = req.body

      if (!nombre || precio === undefined || precio === null) {
        throw new ValidationError("Nombre y precio son obligatorios")
      }
      if (Number(precio) < 0) throw new ValidationError("El precio no puede ser negativo")
      if (Number(stock) < 0) throw new ValidationError("El stock no puede ser negativo")

      if (categoriaId) {
        const categoria = await Categoria.findByPk(categoriaId)
        if (!categoria) throw new NotFoundError("Categoria no encontrada")
      }

      const exists = await Producto.findOne({ where: { nombre } })
      if (exists) throw new ConflictError("Ya existe un producto con ese nombre")

      const producto = await Producto.create({ nombre, descripcion, precio, stock, categoriaId })
      res.status(201).json(producto)
    } catch (error) {
      next(error)
    }
  },

  update: async (req, res, next) => {
    try {
      const producto = await Producto.findByPk(req.params.id)
      if (!producto) throw new NotFoundError("Producto no encontrado")

      const { nombre, descripcion, precio, stock, categoriaId } = req.body

      if (precio !== undefined && Number(precio) < 0) {
        throw new ValidationError("El precio no puede ser negativo")
      }
      if (stock !== undefined && Number(stock) < 0) {
        throw new ValidationError("El stock no puede ser negativo")
      }

      if (nombre && nombre !== producto.nombre) {
        const exists = await Producto.findOne({ where: { nombre } })
        if (exists) throw new ConflictError("Ya existe un producto con ese nombre")
      }

      if (categoriaId) {
        const categoria = await Categoria.findByPk(categoriaId)
        if (!categoria) throw new NotFoundError("Categoria no encontrada")
      }

      await producto.update({ nombre, descripcion, precio, stock, categoriaId })
      res.json(producto)
    } catch (error) {
      next(error)
    }
  },

  remove: async (req, res, next) => {
    try {
      const producto = await Producto.findByPk(req.params.id)
      if (!producto) throw new NotFoundError("Producto no encontrado")
      await producto.destroy()
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
}

module.exports = productoController
