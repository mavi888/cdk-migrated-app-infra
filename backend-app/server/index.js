const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('./config/key');

// DATABASE
console.log('Configuring MongoDB');
const mongoose = require('mongoose');

let mongoURI;
if (config.stage === 'local') {
	console.log('Stage LOCAL');

	mongoURI = config.mongoURI;

	const connect = mongoose
		.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(() => console.log('MongoDB Connected...'))
		.catch((err) => console.log(err));
} else {
	console.log('Stage CLOUD');

	config.getMongoURI().then((mongoURI) => {
		const connect = mongoose
			.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
			.then(() => console.log('MongoDB Connected...'))
			.catch((err) => console.log(err));
	});
}

// SET UP SERVER
if (config.stage === 'local') {
	console.log('Setting CORS for local testing');
	app.use(cors());
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// SET UP ROUTES

app.get('/', (req, res) => {
	res.send('Hi there!');
});
app.use('/api/users', require('./routes/users'));
app.use('/api/product', require('./routes/product'));
app.use('/api/store', require('./routes/store'));

// START SERVER
const port = process.env.PORT || 8080;

app.listen(port, () => {
	console.log(`Server Running at ${port}`);
});
