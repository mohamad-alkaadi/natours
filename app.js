const fs = require('fs');
const express = require('express');
const app = express();
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// 1) Middlewares
app.use(morgan('dev'));
app.use(express.json());
// we use express.static middleware in order to serve static files
// when we use the public folder we use the url http://127.0.0.1:3000/overview.html
// because when we open up a URL that express can't find in any of our routes it will then look in the public folder that we defined and it sets that folder to the root
// we don't write public in the url
app.use(express.static(`${__dirname}/public`));
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
