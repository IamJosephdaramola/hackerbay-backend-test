const mongoose = require('mongoose');
const Schema = mongoose.Schema;

UserSchema = new Schema({
	username: {
		type: String,
		required: [true, 'Please add a valid username'],
		unique: true
	},
	password: {
		type: String,
		required: [true, 'Please, add a valid password']
	}
});

module.exports = User = mongoose.model('users', UserSchema);
