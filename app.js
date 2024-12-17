const fs = require('fs');
const express = require('express');
const app = express();
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// 1) Middlewares
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
// we use express.static middleware in order to serve static files
// when we use the public folder we use the url http://127.0.0.1:3000/overview.html
// because when we open up a URL that express can't find in any of our routes it will then look in the public folder that we defined and it sets that folder to the root
// we don't write public in the url
app.use(express.static(`${__dirname}/public`));
// the next argument is always the third after req and res so we can call next what ever we want  like (n, x, etc...) and will still work like next
// this rule also applies on req and response

app.use((req, res, next) => {
  // define a property on the request object
  req.requestTime = new Date().toISOString();
  next();
});

// 3) Routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// we put this at the end of the file because we want to catch any routes that we haven't defined yet
// we always do this at the end of the file
// this is an error handler or not defined handler
// we do this for unhandled routes
// instead of writing a error handler for each method get() post() patch() etc... wr put all() to select all methods
//  * means all routes
// we do this to get a json response instead of http
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on ths server!`,
  // });

  // next();

  // we can pass the Error a string and it will become err.message
  const err = new Error(`Can't find ${req.originalUrl} on ths server!`);
  err.status = 'fail';
  err.statusCode = 404;
  // if next() receives an argument express will automatically know that is an error
  // and it ignore any other middleware after it and will automatically go to the global error handling middleware and it will get executed
  next(err);
});

// defining our error handling middleware
// error handling middleware has access to 4 parameters req, res, next, error
// when you put 4 parameters in the middleware express automatically knows that is an error middleware
app.use((err, req, res, next) => {
  // we define the default status code
  // this means if express knows the error it will provide it to us if not return 500
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
