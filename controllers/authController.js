const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
    // passwordChangedAt: req.body.passwordChangedAt
  });

  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if the email and password exist
  if (!email || !password) {
    return next(new AppError('please provide email and password', 400));
  }
  // check if the user exists and if the password is correct
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // if everything is okay, send the token to the client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // getting token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = await req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('you are not logged in', 401));
  }
  // validating the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError('the user belonging to this token does not exist', 401)
    );
  // check if the user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('user recently changed password. please log in again', 401)
    );
  }
  // grant access to protected routes
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You donot have permission to perform this action', 403)
      );
    }
    next();
  };
};
