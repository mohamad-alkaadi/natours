const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');

exports.signup = catchAsync(async (req, res, next) => {
  //with this new code we only allow the data that we want to be used
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  //usually in web applications when the user signs up it automatically sign him in
  // we want to sign a JWT then send it to the user
  // jwt.sign(payload, secretOrPrivateKey, [options, callback])
  // the secretOrPrivateKey is the secret

  //create token
  // in the payload the first parameter object for all the data that we want to store in the token
  // the secund parameter is the secret
  // and we only want the id of the user the configration file is the best place to store  the secret
  // third we want to pass options like when is the token is going to expire
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRIES_IN,
  });

  // now we send the token to the client
  // we login the user to the application when we send the token for him
  // but the client need to use the token to login
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});
