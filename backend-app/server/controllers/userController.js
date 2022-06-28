const { User } = require("../models/User");

registerNewUser = async (userInformation) => {
    const user = await new User(userInformation);
    await user.save();
}

login = async (email, password) => {

    const user = await User.findOne({ email: email });

    if (!user) {
        throw new Error("Email not found");
    }
        
    const isMatch = await user.comparePassword(password)
    
    if (!isMatch) {
        throw new Error("Wrong password")
    }

    return await user.generateToken();
}

logout = async(userId) => {
    const user = await User.findOneAndUpdate(
        { _id: userId }, 
        { token: "", tokenExp: "" })
    
    return user
}

module.exports = {
    registerNewUser,
    login,
    logout
}