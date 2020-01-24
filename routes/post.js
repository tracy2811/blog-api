require('dotenv').config();
require('../middlewares/verifyToken');
const models = require('../models');
const validateInput = require('../middlewares/validateInput');
const express = require('express');
const async = require('async');
const jwt = require('jsonwebtoken');
const router = express.Router();

// GET all posts
router.get('/', verifyToken, function (req, res, next) {
	if (!req.token) {
		models.Post.find({ 'published': true, }, 'title body date').exec(function (err, posts) {
			if (err) {
				return res.sendStatus('500');
			}
			res.json(posts);
		});
		return;
	}
	jwt.verify(req.token, process.env.SECRET_KEY, function (err, decoded) {
		if (err) {
			return res.sendStatus('403');
		}
		models.Post.find().exec(function (err, posts) {
			if (err) {
				return res.sendStatus('500');
			}
			res.json(posts);
		});
	});
});

// GET specific post
router.get('/:postID', verifyToken, function (req, res, next) {
	async.parallel({
		post: function (callback) {
			models.Post.findById(req.params.postID).exec(callback);
		},
		comments: function (callback) {
			models.Comment.find({ 'post': req.params.postID, }).exec(callback);
		},
	}, function (err, results) {
		if (err) {
			return res.sendStatus('500');
		}
		if (!results.post) {
			return res.sendStatus('404');
		}
		if (results.post.published) {
			return res.json(results);
		}
		jwt.verify(req.token, process.env.SECRET_KEY, function (err, decoded) {
			if (err) {
				return res.sendStatus('404');
			}
			res.json(results);
		});
	});
});

// POST new post
router.post('/', verifyToken, function (req, res, next) {
	jwt.verify(req.token, process.env.SECRET_KEY, function (err, decoded) {
		if (err) {
			return res.sendStatus('403');
		}
		const post = new models.Post({
			title: req.body.title,
			body: req.body.body,
			published: !!req.body.published,
		});

		post.save(function (err, post) {
			if (err) {
				return res.sendStatus('500');
			}
			res.redirect(`${req.baseUrl}/${post._id}`);
		});
	});
});

// PUT (UPDATE) specific post
router.put('/:postID', verifyToken, function (req, res, next) {
	jwt.verify(req.token, process.env.SECRET_KEY, function (err, decoded) {
		if (err) {
			res.sendStatus('403');
		}
		models.Post.findById(req.params.postID).exec(function (err, post) {
			if (err) {
				return res.sendStatus('500');
			}
			if (!post) {
				return res.sendStatus('404');
			}
		});
		const post = new models.Post({
			title: req.body.title,
			body: req.body.body,
			published: !!req.body.published,
			_id: req.params.postID,
		});
		models.Post.findByIdAndUpdate(req.params.postID, post, function (err, post) {
			if (err) {
				return res.sendStatus('500');
			}
			res.redirect(`${req.baseUrl}/${post._id}`);
		});
	});
});

// DELETE specific post
router.delete('/:postID', verifyToken, function (req, res, next) {
	jwt.verify(req.token, process.env.SECRET_KEY, function (err, decoded) {
		if (err) {
			return res.sendStatus('403');
		}
		models.Post.findById(req.params.postID).exec(function (err, post) {
			if (err) {
				return res.sendStatus('500');
			}
			if (post) {
				models.Comment.deleteMany({ 'post': req.params.postID, }, function (err) {
					if (err) {
						return res.sendStatus('500');
					}
				});
				models.Post.findByIdAndDelete(req.params.postID, function (err) {
					if (err) {
						return res.sendStatus('500');
					}
				});
			}
			res.redirect(`${req.baseUrl}/`);
		});
	});
});

// GET all comments for specific post
router.get('/:postID/comments', verifyToken, function (req, res, next) {
	async.parallel({
		post: function (callback) {
			models.Post.findById(req.params.postID).exec(callback);
		},
		comments: function (callback) {
			models.Comment.find({ 'post': req.params.postID, }).exec(callback);
		},
	}, function (err, results) {
		if (err) {
			return res.sendStatus('500');
		}

		jwt.verify(req.token, process.env.SECRET_KEY, function (err, decoded) {
			if (!results.post || (!results.post.published && err)) {
				return res.sendStatus('404');
			}
			return res.json(results.comments);
		});
	});
});

// POST new comment
router.post('/:postID/comments', validateInput.validateComment, function (req, res, next) {
	models.Post.findById(req.params.postID).exec(function (err, post) {
		if (err) {
			return res.sendStatus('500');
		}

		if (!post || !post.published) {
			return res.sendStatus('404');
		}

		if (req.errors) {
			return res.status('422').json(req.errors);
		}

		const comment = new models.Comment({
			body: req.body.body,
			post: post._id,
		});

		if (req.body.name) {
			comment.name = req.body.name;
		}

		comment.save(function (err) {
			if (err) {
				return res.sendStatus('500');
			}
			res.redirect(`${req.baseUrl}/${req.params.postID}/comments`);
		});
	});
});

// GET specific comment
router.get('/:postID/comments/:commentID', verifyToken, function (req, res, next) {
	models.Comment.findOne({ _id: req.params.commentID, post: req.params.postID, }).populate('post').exec(function (err, comment) {
		if (err) {
			return res.sendStatus('500');
		}
		if (comment) {
			if (comment.post.published) {
				return res.json(comment);
			}
			jwt.verify(req.token, process.env.SECRET_KEY, function (err, decoded) {
				if (err) {
					return res.sendStatus('403');
				}
				return res.json(comment);
			});
		}
		return res.sendStatus('404');
	});
});

// DELETE specific comment
router.delete('/:postID/comments/:commentID', verifyToken, function (req, res, next) {
	jwt.verify(req.token, process.env.SECRET_KEY, function (err, decoded) {
		if (err) {
			return res.sendStatus('403');
		}

		models.Comment.deleteOne({ _id: req.params.commentID, post: req.params.postID, }, function (err) {
			if (err) {
				return res.sendStatus('500');
			}
			res.redirect(`${req.baseUrl}/${req.params.postID}/comments`);
		});
	});
});

// PUT (UPDATE) specific comment
router.put('/:postID/comments/:commentID', validateInput.validateComment, function (req, res, next) {
	models.Comment.findOne({ _id: req.params.commentID, post: req.params.postID}).exec(function (err, comment) {
		if (err) {
			return res.sendStatus('500');
		}
		if (!comment) {
			return res.sendStatus('404');
		}
		if (req.errors) {
			return res.status('422').json(req.errors);
		}
		comment.body = req.body.body;
		if (req.body.name) {
			comment.name = req.body.name;
		}
		comment.save(function (err) {
			if (err) {
				return res.sendStatus('500');
			}
			res.redirect(`${req.baseUrl}/${req.params.postID}/comments`);
		});
	});
});

module.exports = router;

