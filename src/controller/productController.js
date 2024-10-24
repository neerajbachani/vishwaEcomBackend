const Product = require("../models/productModel");
const productService = require("../service/productService")

const createProduct = async (req, res) => {
    try {
      const product = await productService.createProduct( req.body , req.files );
      return res.status(201).send(product);

    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  };

  const updateProduct = async (req, res) => {
    const productId = req.params.id;
    try {
      const updatedProduct = await productService.updateProduct(productId, req.body, req.files);
      console.log('Updated Product in Controller:', updatedProduct);
      return res.status(200).json(updatedProduct);
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  };

const deleteProduct = async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await productService.deleteProduct(productId);
        return res.status(201).send(product);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}
const reorderProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { newOrder } = req.body;

    // Validate input
    if (!productId || newOrder === undefined || newOrder < 0) {
      return res.status(400).json({ 
        error: "Product ID and a valid new order (non-negative number) are required" 
      });
    }

    const updatedProduct = await productService.reorderProduct(productId, newOrder);
    
    return res.status(200).json({
      message: "Product reordered successfully",
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error reordering product:', error);
    return res.status(500).json({ error: error.message });
  }
};


const findProductById = async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await productService.findProductById(productId);
        return res.status(201).send(product);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

// In your controller file
// const getAllProducts = async (req, res) => {
//     try {
//         const products = await productService.getAllProducts(req.query);
//         return res.status(200).json(products);
//     } catch (error) {
//         return res.status(500).json({ error: "An error occurred while fetching products" });
//     }
// };
const getAllProducts = async (req, res) => {
    try {
      const products = await productService.getAllProducts(req.query);
      return res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ error: "An error occurred while fetching products" });
    }
  };

  const updateProductOrder = async (req, res) => {
    try {
      const orderData = req.body;
      for (let item of orderData) {
        await Product.findByIdAndUpdate(item.id, { productOrder: item.productOrder });
      }
      
      // Fetch updated products
      const updatedProducts = await productService.getAllProducts({
        query: '',
        pageNumber: 1,
        pageSize: orderData.length,
        sort: "productOrder"
      });
      
      res.json({
        message: 'Product order updated successfully',
        updatedProducts: updatedProducts.content
      });
      console.log("'Product order updated successfully'");
      console.log(orderData);
    } catch (error) {
      console.error('Error updating product order:', error);
      res.status(500).json({ message: 'Error updating product order', error: error.message });
    }
  };

// const searchProducts = async (req, res) => {
//     const { query , sort } = req.query;
//     console.log("req",req)
//     console.log("query", query)
//     console.log("sort", sort)

    
  
//     try {
//       // Query the database for product suggestions based on the search query
//       const suggestions = await Product.find({ name: { $regex: query, $options: 'i' } }).limit(10);
//       const regex = new RegExp(query, 'i'); 
     
//       const products = await Product.find({ name: { $regex: regex } })

//       let querys = Product.find();

//       if (sort) {
//         const sortDirection = sort === "price_high" ? -1 : 1;
//         querys = querys.sort({ discountedPrice: sortDirection });
//     }
  
//       res.json({ suggestions, products });
//     } catch (error) {
//       console.error('Error fetching product suggestions:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
// }


const createMultipleProducts = async (req, res) => {
    const productId = req.params.id;
    try {
        const products = await productService.createMultipleProducts(req.body);
        return res.status(201).send({message: "Products created succesfully"});
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

module.exports = { createProduct, deleteProduct, updateProduct , getAllProducts, createMultipleProducts, findProductById , updateProductOrder, reorderProduct}