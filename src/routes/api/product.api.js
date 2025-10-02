const express = require('express');
const _ = express.Router();
const productController = require('../../controller/product.controller')
const upload = require('../../middleware/multer.middleware');

_.route('/create-product').post(upload.fields([{name: "image", maxCount:10}]), productController.createProduct)
_.route('/get-all-products').get(productController.getAllProducts);
_.route('/paginate-products').get(productController.paginateProducts);
_.route('/:slug').get(productController.getSingleProduct);
_.route('/update-product/:slug').put(productController.updateProduct);
_.route('/update-product-images').put(upload.fields([{name: "image", maxCount:10}]), productController.updateProductImages)
_.route('/filter').get(productController.filterProducts);
_.route('/delete-product/:slug').delete(productController.deleteProduct);

module.exports = _;
