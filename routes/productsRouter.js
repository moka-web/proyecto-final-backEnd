const express = require('express')
//const productDaos = require('../daos/productDaos.js')
const { checkIfIsAdmin } = require('../utils/checkIfIsAdmin.js');

const { getProducts, getProductById, postProduct, PutProduct, deleteProduct,getByCategory } = require('../controllers/products.js');

const routerProducts = express.Router();

// http://localhost:8080/api/productos/?admin=1 postman

routerProducts.use(checkIfIsAdmin)

routerProducts.get('/', getProducts);

routerProducts.get('/:id', getProductById);

routerProducts.get('/categoria/:categoria', getByCategory);

routerProducts.post('/' , postProduct);

routerProducts.put('/:id', PutProduct);

routerProducts.delete('/:id',deleteProduct);



module.exports = routerProducts;