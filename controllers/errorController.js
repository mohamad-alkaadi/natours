module.exports = (err, req, res, next) => {
  // we define the default status code
  // this means if express knows the error it will provide it to us if not return 500
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
