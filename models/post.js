const moment = require('moment');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
	title: String,
	body: String,
	published: { type: Boolean, default: false, },
	date: { type: Date, default: Date.now(), },
});

PostSchema
.virtual('dateFormatted')
.get(() => moment(this.date).format('YYYY-MM-DD'));

module.exports = mongoose.model('Post', PostSchema);

