const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
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
    required: [true, 'password is mandatory'],
    // only works on create and save
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'passwords do not match'
    }
  }
});

userSchema.pre('save', async function(next) {
  // only run if the password is modified
  if (!this.isModified('password')) return next();
  // hash the password
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
