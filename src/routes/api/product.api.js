const express = require('express');
const _ = express.Router();
const productController = require('../../controller/product.controller')

_.use('/create-product').post(productController.createProduct)

module.exports = _;
