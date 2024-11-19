const Tour = require('./../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);

    //execute query
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // we await the result of features
    const tours = await features.query;

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

// AGGREGATION PIPELINE
exports.getTourStats = async (req, res) => {
  try {
    // its like a query but the difference that we can manipulate data in different steps
    // we pass the aggregate function an array of the stages
    // you can find these stages in https://www.mongodb.com/docs/manual/reference/operator/aggregation-pipeline/
    // you need to await for it to work
    const stats = await Tour.aggregate([
      {
        // the match stage is used to filter the documents
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        // it allows us to group documents together basically using accumulators
        // we can group for example by difficulty level or by price
        // we want to group the averages for all the tours in one big group
        // avg is a keyword
        $group: {
          // to group the results using fields we put the name of the field we want to group by in the id
          // for example we want to group using the rating difficulty level
          // _id: '$ratingsAverage',
          // or we can group them by difficulty level
          // _id: '$difficulty',
          //also we can convert the result to uppercase
          _id: { $toUpper: '$difficulty' },
          // we add one for each documenets using $sum: 1
          num: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
        // in the sort we need to use the fields the we created in the group stage, we sort the grouped fileds
      },
      {
        $sort: {
          avgPrice: 1, // 1 is ascending, -1 is descending
        },
      },
      // {
      //   // we can do stages more than one
      //$NE ===> NOT EQUAL
      //   $match: { _id: { $ne: 'EASY' } },
      // },
    ]);
    res.status(200).json({
      status: 'success',
      data: { stats },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
