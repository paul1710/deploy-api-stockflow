const express = require("express")
const router = express.Router()
const categoriaController = require("../controllers/categoria.controller")
const { authenticate } = require("../middleware/auth.middleware")

router.use(authenticate)

router.get("/", categoriaController.list)
router.get("/:id", categoriaController.getById)
router.post("/", categoriaController.create)
router.put("/:id", categoriaController.update)
router.delete("/:id", categoriaController.remove)

module.exports = router
