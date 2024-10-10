const fs = require('fs');
const express = require('express');
const app = express();
const morgan = require('morgan');

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

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// 2) Route Handlers

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

const getTour = (req, res) => {
  `console`.log(req.params);
  // when we multiply a string that is a number like '3' it will return a number
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      massage: 'Invalid id',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({ status: 'success', data: { tour: newTour } });
    }
  );
};

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      massage: 'Invalid id',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<updated tour here>',
    },
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      massage: 'Invalid id',
    });
  }
  // we send a response of data null o indicate that the data is no longer there
  // it returns 204 and dont show anything on postman
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const getAllUsers = (req, res) => {
  // internal server error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
const getUser = (req, res) => {
  // internal server error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
const createUser = (req, res) => {
  // internal server error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
const updateUser = (req, res) => {
  // internal server error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
const deleteUser = (req, res) => {
  // internal server error
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

// 3) Routes

// tourRouter is a sub application
// create a new router and save it to the variable
const tourRouter = express.Router();
// to connect our new router with our application we use it as middleware
// the tour router only runs on this route
// this is called: mounting the router: means mounting a new router on a route
app.use('/api/v1/tours', tourRouter);

tourRouter.route('/').get(getAllTours).post(createTour);

tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

// ------------------------------------------------
const userRouter = express.Router();
app.use('/api/v1/users', userRouter);

userRouter.route('/').get(getAllUsers).post(createUser);

userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

// 4)  Start server

const port = 3000;
app.listen(port, () => {
  console.log(`app running ono port ${port}`);
});
