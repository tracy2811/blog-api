require('dotenv').config();
require('../middlewares/verifyToken');
const models = require('../models');
const validateInput = require('../middlewares/validateInput');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// POST to login
router.post('/login', function (req, res, next) {
	models.Author.findOne({ 'username': req.body.username, }).exec(function (err, author) {
		if (err) {
			return res.status(500);
		}
		if (!author) {
			return res.status(403).send({
				message: 'Incorrect username'
			});
		}
		bcrypt.compare(req.body.password, author.password, function (err, match) {
			if (!match) {
				return res.status(403).send({
					message: 'Incorrect password'
				});
			}
			jwt.sign({ author, }, process.env.SECRET_KEY, function (err, token) {
				res.json({
					token,
				});
			});
		});
	});
});

// GET user info
router.get('/', verifyToken, function (req, res, next) {
	jwt.verify(req.token, process.env.SECRET_KEY, function (err, decoded) {
		if (err) {
			return res.sendStatus('403');
		}
		/*
		models.Author.findOne({ 'username': decoded.username, 'password': decoded.password}).exec(function (err, author) {
			if (err) {
				return res.sendStatus('500');
			}
			if (!author) {
				return res.sendStatus('403');
			}
		*/
			return res.json(decoded);
	});
});

/*
router.post('/', function (req, res, next) {
	bcrypt.hash(req.body.password, 10, function (err, hashedpassword) {
		if (err) {
			return res.sendStatus('500');
		}
		const author = new models.Author({
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			introduction: req.body.introduction,
			username: req.body.username,
			password: hashedpassword,
		});

		author.save(function (err) {
			if (err) {
				return res.status('500').send('Oops!');
			}
			res.redirect(`${req.baseUrl}/`);
		});
	});
});
*/

// PUT (UPDATE) author info
router.put('/', verifyToken, validateInput.validateAuthor, function (req, res, next) {
	jwt.verify(req.token, process.env.SECRET_KEY, function (err, decoded) {
		if (err) {
			return res.sendStatus('403');
		}
		if (req.errors) {
			return res.status('422').json(req.errors);
		}
		bcrypt.hash(req.body.password, 10, function (err, hashedpassword) {
			if (err) {
				return res.sendStatus('500');
			}

			const author = new models.Author({
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				introduction: req.body.introduction,
				username: req.body.username,
				password: hashedpassword,
				_id: decoded.author._id,
			});

			models.Author.findByIdAndUpdate(decoded.author._id, author, {}, function (err, author) {
				if (err) {
					return res.sendStatus('500');
				}
				res.redirect(`${req.baseUrl}/`);
			});
		});
	});
});

module.exports = router;

