verifyToken = function (req, res, next) {
	const bearerHeader = req.headers['authorization'];
	if (typeof bearerHeader !== 'undefined') {
		const bearer = bearer.split(' ');
		req.token = bearer[1];
	}
	next();
};

