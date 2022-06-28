const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

const userController = require('../controllers/userController');

router.get('/auth', auth, (req, res) => {
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
		history: req.user.history,
	});
});

router.post('/register', async (req, res) => {
	const userInformation = req.body;

	try {
		await userController.registerNewUser(userInformation);
		return res.status(200).json({
			success: true,
		});
	} catch (err) {
		return res.json({ success: false, err });
	}
});

module.exports = router;
