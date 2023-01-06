const logger = require('../config/winston');
const {products, users, carts} = require('../src/daos/mainDaos')();
const { checkIfIsAdmin } = require('../utils/checkIfIsAdmin');
const sendEmail = require('../utils/sendEmail');
const sendSms = require('../utils/sendSms');
const sendWhatsapp = require('../utils/sendWathsapp');



async function getCart (req,res){
    try {
        const user = await users.getById(req.user._id);
       
        const sanitizedUser = { name: user.username, photo_url: user.photo_url, _id: user._id, cart_id: user.cart_id }
         
        const getCart =await carts.getById(sanitizedUser.cart_id)
        
        const cartid = getCart._id;

        const totalPrice =await getCart.products.reduce((acc,item) =>{
            return acc + item.price
        },0)
        
        const priceRound = totalPrice.toFixed(3)

        const allProducts = await getCart.products.map((product) => ({
            name: product.name,
            photo_url: product.photo_url,
            description: product.description,
            price: product.price,
            _id:product._id,
            quantity:product.quantity
        }));

            
        res.render('cartProducts',{allProducts,sanitizedUser,cartid,priceRound})
        
    } catch (error) {
        logger.error(` getCart : ${error.message}`)
        
    }

}

async function addAproductToCart (req,res){
    const cartId= req.params.id;
    const idprod=req.params.idprod;
  
    try {
        const product = await products.getById(idprod)
        const user = await users.getById(req.user._id); 
        const userCart = {cart_id: user.cart_id }
        const cart =await carts.getById(userCart.cart_id)

        //comprueba si existe un producto con el mismo id y modifica la cantidad
        if(!product.quantity){
            await products.modify(idprod,{quantity:1})
        }else 
        if(cart.products.some(e=>e._id == idprod)){

            const productToAdd = cart.products.find(e=>e._id==idprod)
            const productQuant= {
            quantity:productToAdd.quantity
            }

            const addAproduct = await carts.modifyProductCart(cartId,idprod,productQuant)
            res.redirect("/api/productos")

        }else{
            const addAproduct = await carts.addCartProduct(cartId,product)
            res.redirect("/api/productos")
        }

    } catch (error) {
        logger.error( ` addAproductToCart: ${error.message}`)
    }
}


async function deleteCartById (req,res){
    const id = req.params.id;
    try {
        const deleteCart = carts.deleteById(id)
        res.status(200).send({
            status:200,
            message:`el carrito con id ${id} fue eliminado`
        })
    } catch (error) {
        logger.error(`deleteCartById : ${error.message}`)
    }
}

async function deleteCartProduct (req,res){

    const cartId = req.params.id;
    const productId= req.params.idprod;
    try {
        const cart = await carts.getById(cartId);
        const prodInCart= cart.products.find(e=>e._id == productId);
        const prodquant = prodInCart.quantity;

        if(prodquant > 1){
            await carts.deleteByOne(cartId,productId,prodquant)
            res.redirect('/api/carrito')
        }else{
            const deleteProductoFromCart = await carts.deleteCartProduct(cartId,productId)
            res.redirect('/api/carrito')
        }
       
        
    } catch (error) {
        logger.error(`deleteCartProduct:${error.message}`)
        
    }
}


async function finishBuying(req,res){
    try {
        const cart = await carts.getById(req.params.id)
       const user = await users.getById(req.user._id)
        
        await sendEmail('mokajua@gmail.com',
        `Nuevo pedido de ${req.user.username} - ${req.user.email}`,
        JSON.stringify(cart.products)
        )
        
    
        const newUser = await users.deleteCart(cart._id);
       
       
        await sendSms('se registro una nueva orden');
        await sendWhatsapp('se registro una nueva orden')
        
        res.redirect('/')
        
    } catch (error) {
        logger.error(` terminar compra ${error.message}`)
    }
}



module.exports = {getCart,addAproductToCart,deleteCartById,deleteCartProduct,finishBuying}