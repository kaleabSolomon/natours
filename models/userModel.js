const mongoose = require('mongoose');
const validator = require('validator');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name is mandatory']
  },
  email: {
    type: String,
    required: [true, 'email is mandatory'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email address']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'password is mandatory'],
    minLength: 8
  },
  passwordConfirm: {
    type: String,
    required: [true, 'password is mandatory']
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
