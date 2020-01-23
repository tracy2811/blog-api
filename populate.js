#! /usr/bin/env node

// Dotenv
require('dotenv').config();

const async = require('async');
const models = require('./models');
const bcrypt = require('bcryptjs');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let author;
let posts = [];
let comments = [];

function createAuthor(callback) {
	bcrypt.hash('nguyen', 10, function (err, hashedPassword) {
		if (err) {
			return callback(err, null);
		}
		author = new models.Author({
			firstName: 'Tracy',
			lastName: 'Nguyen',
			introduction: 'Hello World',
			username: 'tracy',
			password: hashedPassword,
		});
		author.save(function (err) {
			if (err) {
				return callback(err, null);
			}
			console.log('New User: ' + author);
			console.log('Login using "tracy" as username and "nguyen" as password');
			return callback(null, author);
		});
	});
}

function commentCreate(body, post, name, callback) {
	let comment = new models.Comment({
		body,
		post,
		name,
	});
	comment.save(function (err) {
		if (err) {
			return callback(err, null);
		}
		console.log('New Comment: ' + comment);
		comments.push(comment);
		callback(null, comment);
	});
}

function postCreate(title, body, published, callback) {
	const post = new models.Post({
		title,
		body,
		published,
	});
	post.save(function (err) {
		if (err) {
			return callback(err, null);
		}
		console.log('New Post: ' + post);
		posts.push(post);
		callback(null, post);
	});
}

function createPosts(callback) {
	async.parallel([
		function (callback) {
			postCreate('Lorem ipsum dolor sit amet', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc nec lacus velit. Sed ac risus imperdiet, consequat ligula non, aliquam sapien. Proin tristique justo nec erat tristique tristique sit amet id arcu. Integer ut odio quis arcu vulputate dignissim eu non nisi. Sed rhoncus at nisi quis luctus. Fusce imperdiet odio tempus, dapibus nunc a, pharetra metus. Integer porta massa a hendrerit euismod. Morbi a lorem ac velit malesuada semper a nec est. Quisque pulvinar bibendum facilisis. Maecenas sit amet ultrices metus. Cras vel enim est.', false, callback);
		},
		function (callback) {
			postCreate('In porttitor lacus vitae lorem consequat', 'In porttitor lacus vitae lorem consequat, vitae convallis neque sodales. Sed eget eleifend diam, quis maximus magna. In risus justo, vestibulum et massa eget, gravida tincidunt ipsum. Sed interdum, nulla quis congue vehicula, elit dolor interdum dolor, vitae semper dui ipsum a sapien. Cras mattis, ligula non vestibulum tincidunt, leo tellus sagittis nulla, vitae sodales justo orci vitae nisi. Proin non est in augue malesuada ullamcorper. Aliquam vitae placerat odio. Quisque pharetra vitae purus eu porttitor. Vestibulum interdum, eros blandit porta semper, dui turpis blandit velit, eget porta nunc arcu sed tortor. Nulla facilisi. Mauris ligula eros, varius sed varius in, porta eu mi.', true, callback);
		},
		function (callback) {
			postCreate('Cras ullamcorper rhoncus tincidunt', 'Cras ullamcorper rhoncus tincidunt. Nunc eget erat ante. Nam vulputate nulla lorem, eu viverra odio sollicitudin sed. Nulla leo nisl, pretium eu blandit eget, efficitur sed turpis. Quisque consectetur leo non mauris porttitor, non aliquet mauris porttitor. Etiam condimentum rhoncus elit vitae aliquet. Proin non sapien ligula. Quisque sagittis diam non mauris congue laoreet. Donec feugiat vitae purus id laoreet. Vivamus tincidunt lacinia nisl, eu accumsan lorem tempus non. Sed commodo mollis dui sed laoreet. Nullam efficitur nisi ut viverra dapibus. Mauris sodales mattis mi.', false, callback);
		},
		function (callback) {
			postCreate('Phasellus tempus arcu quis nulla accumsan', 'Phasellus tempus arcu quis nulla accumsan, in fermentum nunc ornare. Sed congue purus a odio elementum, id sodales metus eleifend. Integer sed felis tincidunt, ullamcorper ante eget, mollis eros. Praesent dapibus velit at tortor placerat, id posuere nunc pharetra. Etiam egestas fermentum dui ut scelerisque. Phasellus ut condimentum eros, et gravida libero. Cras luctus cursus nibh sed suscipit. Sed diam est, molestie vitae nisi eget, lobortis imperdiet augue. Proin diam lorem, cursus a erat eu, commodo fringilla quam. Sed nec neque at dolor auctor iaculis nec sed ex. Vivamus vitae bibendum urna, nec congue ligula. Pellentesque scelerisque augue neque, malesuada laoreet erat luctus non. Nunc tincidunt sed ex sit amet lacinia. Curabitur eget velit quis est volutpat aliquet. Quisque vehicula quam id ex hendrerit mollis. Nam a pulvinar urna.', false, callback);
		},

	], callback);
}

function createComments(callback) {
	async.parallel([
		function (callback) {
			commentCreate('Lorem ipsum dolor sit amet, consectetur adipiscing elit.', posts[2]._id, 'Lovely Girl', callback);
		},

		function (callback) {
			commentCreate('In porttitor lacus vitae lorem consequat, vitae convallis neque sodales.', posts[0]._id, 'Cool Boy', callback);
		},

		function (callback) {
			commentCreate('Cras ullamcorper rhoncus tincidunt. Nunc eget erat ante.', posts[1]._id, 'True Nerd', callback);
		},

		function (callback) {
			commentCreate('Phasellus tempus arcu quis nulla accumsan, in fermentum nunc ornare.', posts[2]._id, 'Tricky Teacher', callback);
		},

	], callback);
}

async.series([
	createPosts,
	createComments,
	createAuthor,
], function (err, results) {
	if (err) {
		console.log('FINAL ERR: ' + err);
	} else {
		console.log('DATA GENERATED!');
	}

	mongoose.connection.close();
});

