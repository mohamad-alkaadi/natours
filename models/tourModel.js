const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
  },
  ratingsAverage: { type: Number, default: 4.5 },
  ratingsQuantity: { type: Number, default: 0 },
  price: {
    type: Number,
    required: [true, 'A true must have a name'],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    // it will remove all the white space in the beginning and in the end of the string
    trim: true,
    required: [true, 'A true must have a summary'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    // we put the images somewhere in the file system and we put the name of the image in the database as a reference
    type: String,
    required: [true, 'A true must have a cover image'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDate: [Date], // accepted date format "2021-03-21, 11:32"
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
