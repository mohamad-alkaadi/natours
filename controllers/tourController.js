const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);
    // we need to exclude a certain  query parameters so the database don't search for it and we can use them for other stuff
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // now we remove all this field from our query object
    // to do that we loop over this fields and delete them from the query object using forEach and we use forEach because we don't want to return an array
    excludedFields.forEach((el) => delete queryObj[el]);
    // we use the new queryObj instead of req.query because there is no exclusion in req.query

    // we convert the object into a string

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(JSON.parse(queryStr));

    let query = Tour.find(JSON.parse(queryStr));

    // sorting
    // query.sort is like query.find or Tours.find
    // req.query.sort is passed by the api : 127.0.0.1:3000/api/v1/tours?sort=price
    //its like we write Tours.find().sort(price) or Tours.find().sort(req.query.sort)
    // this will write it in asending order
    //to make it descending we use - before the field name in the api meaning :  127.0.0.1:3000/api/v1/tours?sort=-price
    // sometimes we need to have multiple sorts
    // multiple sorts should look like this Tours.find().sort('price ratingsAverage')
    // so we use a comma between them like this : 127.0.0.1:3000/api/v1/tours?sort=-price,ratingsAverage
    //  and then replace the comma with space in javascript

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      console.log(sortBy);
      query = query.sort(sortBy);
    } else {
      // if user doesn't sort we sort default by created date
      query = query.sort('-createdAt');
    }

    //Limiting Fields // to allow clients to choose which fields they want to get back in the response
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');

      query = query.select(fields);
      // query = query.select('name duration price')
    } else {
      // if we want to exclude something we use - before the field name
      // this is a field that mongodb automatically adds and we don't want to see it in the result
      query = query.select('-__v');
    }

    //execute query
    const tours = await query;

    //response
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    // findById is a shorthand for writing findOne({_id: req.params.id})
    // _id is written like this because its how mongodb names id
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  // const newTours = new Tour({})
  // newTours.save()

  //second method
  // Tour.create({});
  // it returns a promise and instead of .then() we are going to use async await

  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { tour: newTour },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    // we want to query the document  we want to update and update it
    // third arg is options
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      // the newly updated document will be returned
      new: true,
      // to validate the input if it supposed to be an int you can make it string
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
