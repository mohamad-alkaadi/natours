const AppError = require('./../utils/appError');
const handleCastErrorDB = (err) => {
  //path contains the field name for example id
  // value contains the value that we are trying to input for example 1ef23523g234523as ' this an id for example'
  //we took path and value from the error object you can see it returned in postman
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // we have a value in the error object
  // "message": "E11000 duplicate key error collection: natours.tours index: name_1 dup key: { name: \"The Forest Hiker\" }"
  // we want to extract the name of the tour for example
  //the return of the regex
  // [
  //   '"The Forest Hiker"',
  //   '"',
  //   'r',
  //   index: 84,
  //   input: 'E11000 duplicate key error collection: natours.tours index: name_1 dup key: { name: "The Forest Hiker" }',
  //   groups: undefined
  // ]
  //we want the first element of the array
  //[0] to return the first element of the array
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}, Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  //we want to create one big string out of all the strings from all the errors
  // we have to loop over all the objects returned and then extract all the error messages into a new array
  // in javascript we use Object.values in order to basically loop over an object
  // Object.values is these objects
  // "error": {
  //   "errors": {
  //       "ratingsAverage": {
  //           "name": "ValidatorError",
  //           "message": "Rating must be below 5.0",
  //           "properties": {
  //               "message": "Rating must be below 5.0",
  //               "type": "max",
  //               "max": 5,
  //               "path": "ratingsAverage",
  //               "value": 7
  //           },
  //           "kind": "max",
  //           "path": "ratingsAverage",
  //           "value": 7
  //       },
  //       "name": {
  //           "name": "ValidatorError",
  //           "message": "a tour name must have more or equal than 10 characters",
  //           "properties": {
  //               "message": "a tour name must have more or equal than 10 characters",
  //               "type": "minlength",
  //               "minlength": 10,
  //               "path": "name",
  //               "value": "no"
  //           },
  //           "kind": "minlength",
  //           "path": "name",
  //           "value": "no"
  //       }
  //   },
  // then we map thee message part of each object to an array
  const errors = Object.values(err.errors).map((el) => el.message);
  // errors.join () will join all the strings in the array into one string
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError(`Invalid Token. Please log in again!`, 401);
const handleJWTExpiredError = () =>
  new AppError(`Your Token has expired . Please log in again!`, 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // programming or other unknown error: don't leak details to the client
  } else {
    // 1) log error
    console.error('Error :(', err);
    // 2) send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  // we define the default status code
  // this means if express knows the error it will provide it to us if not return 500
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // we want to reassign the error so we make a hard copy of it becouse it's not a good practace to change the orginal one
    let error = { ...err };
    if (err.errmsg) error.errmsg = err.errmsg;
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};
