const { User } = require('../models/User');

registerNewUser = async (userInformation) => {
	const user = await new User(userInformation);
	await user.save();
};

module.exports = {
	registerNewUser,
};
