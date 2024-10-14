const fs = require('fs');
const express = require('express');
const app = express();
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// 1) Middlewares
app.use(morgan('dev'));
app.use(express.json());
// the next argument is always the third after req and res so we can call next what ever we want  like (n, x, etc...) and will still work like next
// this rule also applies on req and response
app.use((req, res, next) => {
  console.log('hello from the middleware');
  // if we don't call next here the request will be stuck here
  next();
});
app.use((req, res, next) => {
  // define a property on the request object
  req.requestTime = new Date().toISOString();
  next();
});

// 3) Routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
