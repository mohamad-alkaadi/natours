const fs = require('fs');
const express = require('express');
const app = express();
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
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
  next(new AppError(`Can't find ${req.originalUrl} on ths server!`, 404));
});

// defining our error handling middleware
app.use(globalErrorHandler);

module.exports = app;
