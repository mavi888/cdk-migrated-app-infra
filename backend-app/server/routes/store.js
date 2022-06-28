const express = require('express');
const router = express.Router();
const { auth } = require("../middleware/auth");

const storeController = require('../controllers/storeController')

router.get('/addToCart', auth, async (req, res) => {
    const userId = req.user._id;
    const productId = req.query.productId

    try {
        const userUpdated = await storeController.addProductToCart(userId, productId);
        return res.status(200).json(userUpdated.cart)
    } catch (err) {
        return res.json({ success: false, err })
    }
});

router.get('/removeFromCart', auth, async (req, res) => {
    const userId = req.user._id;
    const itemIdToRemove = req.query._id;

    try {
        const r = await storeController.removeFromCart(userId, itemIdToRemove);
        return res.status(200).json(r)
    } catch(err) {
        return res.json({ success: false, err })
    }   
})

// TODO: remove as nobody is using it
router.get('/userCartInfo', auth, async (req, res) => {
    const userId = req.user._id;

    try {
        const r = await storeController.getCartInfo(userId);
        const cartDetail = r.cartDetail;
        const cart = r.cart;
        return res.status(200).json({ success: true, cartDetail, cart });
    } catch(err) {
        return res.status(400).send(err);
    }
})

router.post('/successBuy', auth, async (req, res) => {

    const cartDetail = req.body.cartDetail;
    const userId = req.user._id
    const userName = req.user.name
    const userLastName = req.user.lastname
    const userEmail = req.user.email;

    try {
        const cart = await storeController.buyItems(cartDetail, userId, userName, userLastName, userEmail);

        return res.status(200).json({
            success: true,
            cart: cart,
            cartDetail: []
        })
    } catch (err) {
        return res.json({ success: false, err });
    }
})

router.get('/getHistory', auth, async (req, res) => {
    const userId = req.user._id;

    try {
        const history = await storeController.getHistory(userId);
        return res.status(200).json({ success: true, history })
    } catch (err) {
        return res.status(400).send(err)
    }
})

module.exports = router;
