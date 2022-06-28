const { User } = require("../models/User");
const { Payment } = require('../models/Payment');

const productController = require('../controllers/productController')
const { v4: uuidv4 } = require('uuid');

addProductToCart = async (userId, productId) => {

    const userInfo = await User.findOne({ _id: userId });

    let duplicate = false;
    
    userInfo.cart.forEach((item) => {
        if (item.id == productId) {
            duplicate = true;
        }
    })
    
    if (duplicate) {
        const userUpdated = await User.findOneAndUpdate(
                { _id: userId, "cart.id": productId },
                { $inc: { "cart.$.quantity": 1 } },
                { new: true })
                
        return userUpdated;

    } else {
        const userUpdated = await User.findOneAndUpdate(
                { _id: userId },
                {
                    $push: {
                        cart: {
                            id: productId,
                            quantity: 1,
                            date: Date.now()
                        }
                    }
                },
                { new: true })

        return userUpdated;
    }
}

removeFromCart = async (userId, itemIdToRemove) => {
    const userUpdated = await User.findOneAndUpdate(
        { _id: userId },
        {
            "$pull":
                { "cart": { "id": itemIdToRemove } }
        },
        { new: true })

    let cart = userUpdated.cart;

    let array = cart.map(item => {
        return item.id
    })

    const cartDetail = await productController.findProductById(array);

    const r = {
        cartDetail, 
        cart
    }
    return r;
}

getCartInfo = async (userId) => {
    const userInfo = await User.findOne({ _id: userId });

    let cart = userInfo.cart;
    let array = cart.map(item => {
        return item.id
    })

    const cartDetail = await productController.findProductById(array);

    const r = {
        cartDetail, 
        cart
    }
    return r;
}

buyItems = async (cartDetail, userId, userName, userLastName, userEmail) => {

    let history = [];
    let transactionData = {};
    const paymentId = uuidv4();
    
    // Add a new item to the history 
    cartDetail.forEach((item) => {        
        history.push({
            dateOfPurchase: Date.now(),
            name: item.title,
            id: item._id,
            price: item.price,
            quantity: item.quantity,
            paymentId: paymentId
        })

    })

    // Put Payment Information that come from payment into payment collection 
    transactionData.user = {
        id: userId,
        name: userName,
        lastname: userLastName,
        email: userEmail
    }

    transactionData.data = paymentId;
    transactionData.product = history

    const user = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { history: history }, $set: { cart: [] } },
        { new: true });
       
    const payment = new Payment(transactionData);
    const doc = await payment.save()
                
    //Increase the amount of number for the sold information 
    doc.product.forEach(async item => {
        await productController.updateProductQuantity(item.id, item.quantity)
    })

    return user.cart;
}

getHistory = async(userId) => {
    const user = await User.findOne({ _id: userId });

    const history = user.history;
    return history;
}

module.exports = {
    addProductToCart,
    removeFromCart,
    getCartInfo,
    buyItems,
    getHistory,
}
