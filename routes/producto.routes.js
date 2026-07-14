const express = require("express")
const router = express.Router()
const productoController = require("../controllers/producto.controller")
const { authenticate } = require("../middleware/auth.middleware")

router.use(authenticate)

router.get("/", productoController.list)
router.get("/:id", productoController.getById)
router.post("/", productoController.create)
router.put("/:id", productoController.update)
router.delete("/:id", productoController.remove)

module.exports = router
