const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');

// instead of genrating jwt in every conttroler we can make a function for it
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRIES_IN,
  });
};

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
  // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRIES_IN,
  // });
  const token = signToken(newUser._id);

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

exports.login = catchAsync(async (req, res, next) => {
  // the first method
  // const email = req.body.email
  // const password = req.body.password
  // we can use object destructuring to do the same thing
  const { email, password } = req.body;
  // 1) check if email and password exist
  if (!email || !password) {
    // we create a new error and or global handling middleware will pick it up and send that error back to the client
    //400 for bad request
    // we write return so the login middleware so the login middleware will stop
    return next(new AppError('Please provide email and password', 400));
  }
  // 2) check if user exists && password is correct
  // we write +password instead of password because we have hidden the password form the database
  const user = await User.findOne({ email }).select('+password');
  //the password returned from the database for example is: $2a$12$HEWl18Go5c5Tp.dFxuQzjePEDAUwRHrSH/BpANFgDGAYD.yobz5yK
  // and we entered the this password for example: password12345
  // we need to encrypt the password the interred by the user then compere it with the password that is entered in the database
  // then compare the original encrypted password with the encrypted password that we got from the user
  // we can implement this in the userModel to make our controller slimmer
  // we can use the method implemented in the model here in the controller
  //user that we quered from the database is a user document and we can access all its methods
  // userSchema.methods.correctPassword = async function ( candidatePassword,userPassword)

  // const correct = await user.correctPassword(password, user.password);
  // Incorrect email or password we do them together so the attacker doesn't know whether the email or password is incorrect
  // if (!user || !correct) {
  // we can move it to the if statement
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // 3) if everything is ok, send token to the client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting the token and check if it exists
  // these conditions  that we should meet to save the token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // the return of the req.headers.authorization is: Bearer dsajkfjkhsajkdh24kjakdjsakj21kekja
    // so we need to split it by the space and the return is the array of two items [Bearer,dsajkfjkhsajkdh24kjakdjsakj21kekja]
    // then we select the secund item from the array like this [1]
    token = req.headers.authorization.split(' ')[1];
  }
  // console.log('token is:', token);

  if (!token) {
    return next(
      // 401 means the data that we have sent with the request is correct but they are not enough to get the user access to the resource that he is requesting
      new AppError('Your are not logged in! Please log in to get access', 401)
    );
  }

  // 2) validate token: the JWT algorithms verifies if the signature is valid or if it's not or if the token is valid or not

  // if the verification is successful we also need to check if the user who's trying to access the route still exists
  // to verify we use the verify method from jwt
  // first parameter is the token that we acquired the secund is the secret and the third is the callback
  // it will verify the token and once its verified it will call the callback function
  // we don't want to break the pattern of promises in functions so we want to promisify the function so we can use async/await
  // node have a built in promisify function and it is inside util
  // jwt.verify(token, process.env.JWT_SECRET);

  // the result of promisify(jwt.verify(token, process.env.JWT_SECRET)); is a promise that we can await
  // it will be thee decoded payload from the JSON web token
  // this step is a verification step to see if there is no one that has altered the id of the user
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log('decoded is:', decoded);

  //we have two errors we need to handle with the messages of invalid signature error , and the error of the token expired
  // these two errors are under the name of JsonWebTokenError
  //  we need to handle it in our error controller
  // --------------------------------------
  // 3) Check if user still exists
  // has the user been deleted after the token has been issued

  // freshUser has no meaning you can change it letter to checkedUser
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exists.',
        401
      )
    );
  }
  // 4) Check if the user changed password after the JWT token was issued
  // what if the user has changed his password after the token has been issued
  // if someone has stole the JWT from the user so in order for the user to protect himself the user has changed his password
  // so token that has been issued before the password changed should no longer be valid and should not be accepted to access protected routes
  // to do this we make an instance method on the model
  //iat is the Issued At Time
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again.', 401)
    );
  }
  // 5) GRANT ACCESS TO PROTECTED ROUTE
  // if all steps are correct then we hit next so we can continue to the handler function
  req.user = freshUser;
  next();
});
