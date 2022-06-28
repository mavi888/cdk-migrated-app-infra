const {
	SecretsManagerClient,
	GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');

const secretManagerClient = new SecretsManagerClient({
	region: process.env.REGION,
});

const getMongoURI = () => {
	const params = {
		SecretId: 'mongoURI',
	};

	const command = new GetSecretValueCommand(params);
	return secretManagerClient.send(command).then((response) => {
		return response.SecretString;
	});
};

module.exports = {
	getMongoURI,
	stage: 'cloud',
};
