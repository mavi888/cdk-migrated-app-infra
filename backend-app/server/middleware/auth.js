const {
	CognitoIdentityProviderClient,
	GetUserCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const cognitoIdentityServiceProvider = new CognitoIdentityProviderClient({
	region: process.env.REGION,
});

const { CognitoJwtVerifier } = require('aws-jwt-verify');

const { User } = require('../models/User');

const config = require('../config/key');

const userPoolId = config.userPoolId;
const userPoolClientId = config.userPoolClientId;

let auth = (req, res, next) => {
	const token = req.headers.authorization;
	const jwtToken = token.replace('Bearer ', '');

	verifyToken(jwtToken)
		.then((valid) => {
			if (valid) {
				getCognitoUser(jwtToken).then((email) => {
					User.findByEmail(email, (err, user) => {
						if (err) throw err;
						if (!user)
							return res.json({
								isAuth: false,
								error: true,
							});

						req.user = user;
						next();
					});
				});
			} else {
				throw Error('Not valid Token');
			}
		})
		.catch((error) => {
			return res.json({
				isAuth: false,
				error: true,
			});
		});
};

const verifyToken = async (token) => {
	// Verifier that expects valid access tokens:
	const verifier = CognitoJwtVerifier.create({
		userPoolId: userPoolId,
		tokenUse: 'access',
		clientId: userPoolClientId,
	});

	try {
		const payload = await verifier.verify(token);
		return true;
	} catch {
		console.log('Token not valid!');
		return false;
	}
};

const getCognitoUser = async (jwtToken) => {
	const params = {
		AccessToken: jwtToken,
	};

	const command = new GetUserCommand(params);
	const response = await cognitoIdentityServiceProvider.send(command);

	const email = response.UserAttributes[3];
	return email.Value;
};

module.exports = { auth };
