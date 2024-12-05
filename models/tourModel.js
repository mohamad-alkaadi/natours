const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      // validation
      maxlength: [40, 'a tour name must have less or equal than 40 characters'],
      minlength: [10, 'a tour name must have more or equal than 10 characters'],
      // validator: [validator.isAlpha, 'Tour name must only contain characters'],
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
      //validation
      //we want to restruct the input into 'easy','medium', 'difficult
      // enum only works for strings
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      //validation
      // min and max works with numbers and dates
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: {
      type: Number,
      required: [true, 'A true must have a name'],
    },
    // we want to validate if the price discount is lower than the price itself
    priceDiscount: {
      type: Number,
      // val refers to the value of priceDiscount
      validate: {
        // the function has access to the current document only on create so it will not work on update (meaning the "this" keyword only works on document creation not update)
        validator: function (val) {
          return val < this.price; // this refers to the current document
          // it returns true or false depending on the validation
        },
        // we can access the value of the priceDiscount in strings using ({}) it is a special feature in mongoose
        message: 'Discount price ({VALUE}) should be below the regular price',
      },
    },
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
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  console.log(docs);

  next();
});
// AGGREGATION MIDDLEWARE

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
