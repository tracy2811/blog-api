const moment = require('moment');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
	body: { type: String, required: true, },
	name: String,
	post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, },
	date: { type: Date, default: Date.now(), },
});

CommentSchema
.virtual('dateFormatted')
.get(() => moment(this.date).format('YYYY-MM-DD'));

module.exports = mongoose.model('Comment', CommentSchema);

