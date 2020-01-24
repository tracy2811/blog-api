// Validate comment
const validateComment = function (req, res, next) {
	let body = req.body.body;
	let name = req.body.name;
	if (!body || !body.trim()) {
		req.errors = { body: 'Comment required', };
	} else {
		req.body.body = body.trim();
	}
	if (name) {
		req.body.name = name.trim();
	}
	next();
};

// Validate author
const validateAuthor = function (req, res, next) {
	let errors = {};
	if (!req.body.firstName || !req.body.firstName.trim()) {
		errors.firstName = 'First Name required';
	}
	if (!req.body.lastName || !req.body.lastName.trim()) {
		errors.lastName = 'Last Name required';
	}
	if (!req.body.username || !req.body.username.trim()) {
		errors.username = 'Username required';
	}
	if (!req.body.password) {
		errors.password = 'Password required';
	} else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/.test(req.body.password)){
		errors.password = 'Password too weak. Must contain at least 8 character, 1 digit, 1 uppercase and 1 lowercase.';
	}
	if (Object.entries(errors).length) {
		req.errors = errors;
	}
	next();
}

module.exports = {
	validateAuthor,
	validateComment,
};

