const mongoose = require('mongoose');
const slugify = require('slugify');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: String,
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
      select: false,
    },
    startDates: [Date], // accepted date format "2021-03-21, 11:32"
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARE
// the 'find' parameter will make it a query middleware not a document middleware
// the 'find' parameter means we wand to run this middleware before the 'find' query
// example the we want to make secret tour in our database for very small vip group of people
// and we don't want our secret tours to appear in the result of our public route
//so we want to create a secret tour field and then query only for tours that are not secret
// tourSchema.pre('find', function (next) {
// if we want to make it work on all of the find queries: find, findOne, findMany, findById ... we use regular expressions
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
// in the post find middleware we have access to all the documents that were found in our query
// this wil run post the find method
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);

  console.log(docs);

  next();
});
// AGGREGATION MIDDLEWARE
// aggregation middleware allows us to add hooks before or after an aggregation happens
// we also want to execulde the secret tours in our aggregation pipline

tourSchema.pre('aggregate', function (next) {
  // to access the pipeline array we use the 'this.pipeline'
  // to add an element at the beginning of the array we use unshift, we use shift to add at the last element
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
