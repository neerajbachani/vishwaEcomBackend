const express = require("express")
const router = express.Router()

const productController = require("../controller/productController")
const {authenticate} = require("../middleware/authenticate.js");
const Product = require("../models/productModel.js");



router.post("/", authenticate, productController.createProduct)
router.post("/creates", authenticate, productController.createMultipleProducts)
router.delete("/:id", authenticate, productController.deleteProduct)
router.put("/:id",authenticate, productController.updateProduct)
// In your Express route handler

router.put('/productOrder', async (req, res) => {
    try {
      const orderData = req.body;
      for (let item of orderData) {
        await Product.findByIdAndUpdate(item.id, { productOrder: item.productOrder });
      }
      res.json({ message: 'Product order updated successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Error updating product order', error: error.message });
    }
  });

module.exports = router

