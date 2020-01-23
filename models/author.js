const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
	firstName: { type: String, required: true, },
	lastName: { type: String, required: true, },
	introduction: String,
	username: { type: String, required: true, },
	password: { type: String, required: true, },
});

AuthorSchema
.virtual('fullName')
.get(() => `${firstName} ${lastName}`);

module.exports = mongoose.model('Author', AuthorSchema);

