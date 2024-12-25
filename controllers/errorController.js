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

    sendErrorProd(error, res);
  }
};
