const fs = require('fs');
const express = require('express');
const app = express();

// middleware: is a function that can modify the incoming request data
// it is called middleware because it stands in the middle of the request and the response
// it is a step that the request goes through while it's being processed
// the express.json is a middleware
app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);
// get request
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

// post request
app.post('/api/v1/tours', (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  // Object.assign allows us to create a new object by merging two existing objects together
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      // res.status.json send a response like res.send
      res.status(201).json({ status: 'success', data: { tour: newTour } });
    }
  );
});

const port = 3000;
app.listen(port, () => {
  console.log(`app running ono port ${port}`);
});
