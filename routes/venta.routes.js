const express = require("express")
const router = express.Router()
const ventaController = require("../controllers/venta.controller")
const { authenticate } = require("../middleware/auth.middleware")

router.use(authenticate)

router.get("/", ventaController.list)
router.get("/:id", ventaController.getById)
router.post("/", ventaController.create)
router.delete("/:id", ventaController.remove)

module.exports = router
