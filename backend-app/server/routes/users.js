const express = require('express');
const router = express.Router();
const { auth } = require("../middleware/auth");

const userController = require('../controllers/userController')

router.get("/auth", auth, (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image,
        cart: req.user.cart,
        history: req.user.history
    });
});

router.post("/register", async (req, res) => {
    const userInformation = req.body;

    try {
        await userController.registerNewUser(userInformation);
        return res.status(200).json({
            success: true
        });
    } catch (err) {
        return res.json({ success: false, err });
    }
});

router.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await userController.login(email, password);
        res.cookie("w_authExp", user.tokenExp);
        res.cookie("w_auth", user.token)
            .status(200)
            .json({
                loginSuccess: true, userId: user._id
            });
    } catch (err) {
        if (err.message === "Email not found") {
            return res.json({ 
                loginSuccess: false, 
                message: "Auth failed, email not found"
            }); 
        }
        if (err.message === 'Wrong password') {
            return res.json({ 
                loginSuccess: false, 
                message: "Wrong password"  
            }); 
        }
        
        return res.status(400).send(err);
    } 
});

router.get("/logout", auth, async (req, res) => {
    const userId = req.user._id

    try {
        await userController.logout(userId);
        return res.status(200).send({
            success: true
        }); 
    } catch(err) {
        return res.json({ success: false, err });
    }
});

module.exports = router;
