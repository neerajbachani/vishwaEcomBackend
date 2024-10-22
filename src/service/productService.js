const Product = require("../models/productModel");
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const { createReadStream } = require('fs');
const { default: mongoose } = require("mongoose");

async function createProduct(reqData, files) {
  const image = files[0]; // Assuming there's only one file in the files array  
  try {
    if (image) {
      const stream = cloudinary.uploader.upload_stream(
        {
          file: image.path || '',
        },
        async (error, result) => {
          if (error) {
            throw new Error('Failed to upload image');
          }
          
          // Helper function to safely get the first element of an array or return the value itself
          const getFirstOrValue = (value) => Array.isArray(value) ? value[0] : value;
          
          // Calculate discount
          const price = Number(getFirstOrValue(reqData.price));
          const discountedPrice = Number(getFirstOrValue(reqData.discountedPrice));
          const discount = Number(((price - discountedPrice) / price) * 100).toFixed(2);

          let productOrder = 0;
          if (reqData.productOrder) {
            // If a specific order is requested, we need to shift existing products
            if (Number(getFirstOrValue(reqData.productOrder)) > 0) {
              await Product.updateMany(
                { productOrder: { $gte: Number(getFirstOrValue(reqData.productOrder)) } },
                { $inc: { productOrder: 1 } }
              );
              productOrder = Number(getFirstOrValue(reqData.productOrder));
            }
          } else {
            // If no order specified, put it at the end
            const lastProduct = await Product.findOne({}, {}, { sort: { productOrder: -1 } });
            productOrder = lastProduct ? lastProduct.productOrder + 1 : 1;
          }

          const product = new Product({
            name: getFirstOrValue(reqData.name),
            description1: getFirstOrValue(reqData.description1),
            description2: getFirstOrValue(reqData.description2),
            description3: getFirstOrValue(reqData.description3),
            price: price,
            discountedPrice: discountedPrice,
            quantity: Number(getFirstOrValue(reqData.quantity)),
            color: getFirstOrValue(reqData.color),
            resin: getFirstOrValue(reqData.resin),
            varmalaPreservation: getFirstOrValue(reqData.varmalaPreservation),
            wallClock: getFirstOrValue(reqData.wallClock),
            namePlate: getFirstOrValue(reqData.namePlate),
            navkarMantraFrame: getFirstOrValue(reqData.navkarMantraFrame),
            geodeArt: getFirstOrValue(reqData.geodeArt),
            workshop: getFirstOrValue(reqData.workshop),
            resinSpecial: getFirstOrValue(reqData.resinSpecial),
            resinRawMaterials: getFirstOrValue(reqData.resinRawMaterials),
            digitalArt: getFirstOrValue(reqData.digitalArt),
            festivalSpecial: getFirstOrValue(reqData.festivalSpecial),
            jewel: getFirstOrValue(reqData.jewel),
            business: getFirstOrValue(reqData.business),
            lippanArt: getFirstOrValue(reqData.lippanArt),
            vintage: getFirstOrValue(reqData.vintage),
            option: getFirstOrValue(reqData.option),
            details: getFirstOrValue(reqData.details),
            weight: getFirstOrValue(reqData.weight) || 10,
            discount: discount,
            productOrder,
            image: result.secure_url,
          });

          return product.save();
        }
      );

      const bufferStream = streamifier.createReadStream(image.buffer);
      bufferStream.pipe(stream);
    }
  } catch (error) {
    throw error; // Rethrow the error to be handled by the calling function
  }
}


async function updateProduct(productId, reqData, files) {
  try {
      const product = await Product.findById(productId);
      if (!product) {
          throw new Error('Product not found');
      }

      // Calculate discount
      const price = reqData.price || product.price;
      const discountedPrice = reqData.discountedPrice || product.discountedPrice;
      const discount = Number(((price - discountedPrice) / price) * 100).toFixed(2);

      // Update product fields based on reqData
      product.name = reqData.name || product.name;
      product.description1 = reqData.description1 || product.description1;
      product.description2 = reqData.description2 || product.description2;
      product.description3 = reqData.description3 || product.description3;
      product.price = price;
      product.discountedPrice = discountedPrice;
      product.quantity = reqData.quantity || product.quantity;
      product.color = reqData.color || product.color;
      product.resin = reqData.resin || product.resin;
      product.varmalaPreservation = reqData.varmalaPreservation || product.varmalaPreservation;
      product.workshop = reqData.workshop || product.workshop;
      product.wallClock = reqData.wallClock || product.wallClock;
      product.namePlate = reqData.namePlate || product.namePlate;
      product.navkarMantraFrame = reqData.navkarMantraFrame || product.navkarMantraFrame;
      product.geodeArt = reqData.geodeArt || product.geodeArt;
      product.resinSpecial = reqData.resinSpecial || product.resinSpecial;
      product.resinRawMaterials = reqData.resinRawMaterials || product.resinRawMaterials;
      product.digitalArt = reqData.digitalArt || product.digitalArt;
      product.festivalSpecial = reqData.festivalSpecial || product.festivalSpecial;
      product.jewel = reqData.jewel || product.jewel;
      product.business = reqData.business || product.business;
      product.lippanArt = reqData.lippanArt || product.lippanArt;
      product.vintage = reqData.vintage || product.vintage;
      product.option = reqData.option || product.option;
      product.details = reqData.details || product.details; 
      product.discount = discount;
      product.weight = reqData.weight || product.weight
      let newImageUrl = product.image; // Initialize with the current image URL

      // Check if a new image was uploaded
      if (files && files.length > 0) {
          const image = files[0];
          const uploadResult = await new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                  {
                      upload_preset: 'resingiftstore',
                      file: image.path || '',
                  },
                  (error, result) => {
                      if (error) {
                          reject(new Error('Failed to upload image'));
                      } else {
                          resolve(result);
                      }
                  }
              );

              const bufferStream = streamifier.createReadStream(image.buffer);
              bufferStream.pipe(stream);
          });

          // Update the newImageUrl with the new uploaded image URL
          newImageUrl = uploadResult.secure_url;
      }

      // Update the product's image field with the new image URL
      product.image = newImageUrl;

      const updatedProduct = await product.save();
      return updatedProduct;
  } catch (error) {
      throw error;
  }
}


async function deleteProduct(productId) {
    const product = await findProductById(productId);

    await Product.findByIdAndDelete(productId);

    return "Product deleted successfully";
}



async function findProductById(id) {
    const product = await Product.findById(id).exec();
  
    if (!product) {
      throw new Error("Product not found with id " + id);
    }
  
    return product;
}

async function getAllProducts(reqQuery) {
  let {
    query: searchQuery,
    sizes,
    minPrice,
    maxPrice,
    minDiscount,
    sort,
    stock,
    pageNumber,
    pageSize,
    ...otherFilters
  } = reqQuery;

  pageNumber = parseInt(pageNumber) || 1;
  pageSize = parseInt(pageSize) || 10;

  let query = Product.find();

  // Handle search query
  if (searchQuery) {
    const regex = new RegExp(searchQuery, 'i');
    query = query.where('name').regex(regex);
  }

  // Handle other filters
  const filterFields = [
    'color', 'resin', 'digitalArt', 'jewel', 'festivalSpecial', 'business', 'lippanArt', 'vintage', 'geodeArt', 'resinRawMaterials'
  ];

  let orConditions = [];

  filterFields.forEach(field => {
    if (reqQuery[field]) {
      let values = Array.isArray(reqQuery[field]) ? reqQuery[field] : [reqQuery[field]];
      values = values.flatMap(v => v.split(',')).map(v => v.trim().toLowerCase());
      
      if (values.length > 0) {
        orConditions.push({ [field]: { $in: values.map(v => new RegExp(v, 'i')) } });
      }
    }
  });

  if (orConditions.length > 0) {
    query = query.and([{ $or: orConditions }]);
  }

  if (sizes) {
    const sizeValues = Array.isArray(sizes) ? sizes : sizes.split(',');
    query = query.where("sizes.name").in(sizeValues.map(v => v.trim().toLowerCase()));
  }

  if (minPrice && maxPrice) {
    query = query.where('discountedPrice').gte(minPrice).lte(maxPrice);
  }

  if (minDiscount) {
    query = query.where("discount").gte(minDiscount);
  }

  if (stock) {
    if (stock === "in_stock") {
      query = query.where("quantity").gt(0);
    } else if (stock === "out_of_stock") {
      query = query.where("quantity").eq(0);
    }
  }

  // Handle sorting
 
  if (sort === "price_high") {
    query = query.sort({ discountedPrice: -1, productOrder: 1 });
  } else if (sort === "price_low") {
    query = query.sort({ discountedPrice: 1, productOrder: 1 });
  } else {
    // Always sort by productOrder as the primary or secondary sort
    query = query.sort({ productOrder: 1 });
  }

  const totalProducts = await Product.countDocuments(query);

  const skip = (pageNumber - 1) * pageSize;
  query = query.skip(skip).limit(pageSize);

  const products = await query.exec();
  const totalPages = Math.ceil(totalProducts / pageSize);

  return { content: products, currentPage: pageNumber, totalPages, totalProducts };
}

async function reorderProduct(productId, newOrder) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findById(productId).session(session);
    if (!product) {
      throw new Error('Product not found');
    }

    const oldOrder = product.productOrder;
    if (newOrder === oldOrder) {
      await session.abortTransaction();
      return product;
    }

    // Update orders of other products
    if (newOrder < oldOrder) {
      // Moving up in order
      await Product.updateMany(
        {
          productOrder: { $gte: newOrder, $lt: oldOrder },
          _id: { $ne: productId }
        },
        { $inc: { productOrder: 1 } }
      ).session(session);
    } else {
      // Moving down in order
      await Product.updateMany(
        {
          productOrder: { $gt: oldOrder, $lte: newOrder },
          _id: { $ne: productId }
        },
        { $inc: { productOrder: -1 } }
      ).session(session);
    }

    // Update the order of the target product
    product.productOrder = newOrder;
    await product.save({ session });

    await session.commitTransaction();
    return product;
  } catch (error) {
    await session.abortTransaction();
    throw new Error(`Failed to reorder product: ${error.message}`);
  } finally {
    session.endSession();
  }
}

async function createMultipleProducts(products){
    for(let product of products){
        await createProduct(product)
    }
}

module.exports = { createProduct, deleteProduct, updateProduct, findProductById, getAllProducts, createMultipleProducts, reorderProduct }

  
