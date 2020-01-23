require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');
const app = express();

mongoose.connect(
	process.env.MONGODB_URI,
	{ useNewUrlParser: true, useUnifiedTopology: true, }
);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

app.use(express.json());
app.use(express.urlencoded({ extended: true, }));

app.use('/posts', routes.post);
app.use('/author', routes.author);

app.use((err, req, res, next) => res.sendStatus(404));

app.listen(
	process.env.PORT,
	() => console.log(`Sever started on port ${process.env.PORT}`)
);

