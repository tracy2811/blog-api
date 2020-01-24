const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const mongoSever = new MongoMemoryServer();

mongoose.Promise = Promise;
mongoSever.getConnectString().then(mongoUri => {
	const mongooseOpts = {
		autoReconnect: true,
		reconnectTries: Number.MAX_VALUE,
		reconnectInterval: 1000,
		useNewUrlParser: true,
	};

	mongoose.connect(mongoUri, mongooseOpts);

	mongoose.connection.on('error', e => {
		if (e.message.code === 'ETIMEDOUT') {
			console.log(e);
			mongoose.connect(mongoUri, mongooseOpts);
		}
		console.log(e);
	});

	mongoose.connection.once('open', () => {
		console.log(`MongoDB successfully connected to ${mongoose}`);
	});
});

