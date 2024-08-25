const express = require("express")
const router = express.Router()

const productController = require("../controller/productController")
const {authenticate} = require("../middleware/authenticate.js");
const Product = require("../models/productModel.js");

router.put('/updateProductOrder', authenticate, productController.updateProductOrder);

router.post("/", authenticate, productController.createProduct)
router.post("/creates", authenticate, productController.createMultipleProducts)
router.delete("/:id", authenticate, productController.deleteProduct)
router.put("/:id",authenticate, productController.updateProduct)
// In your Express route handler


module.exports = router

