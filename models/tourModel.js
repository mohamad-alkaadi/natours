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
  },
  {
    // when the data is being outputted as json
    toJSON: { virtuals: true },
    // when the data is being outputted as object
    toObject: { virtuals: true },
  }
);
// tourSchema.virtual('name of the virtual property'). (the method)
// when we want to use this we use regular functions
tourSchema.virtual('durationWeeks').get(function () {
  // 'this" will point to the current document
  return this.duration / 7;
});

//this is a pre middleware that will run before the save method
// this is also called a PRE SAVE HOOK
//DOCUMENT MIDDLEWARE: it runs before .save() and .create() methods but not after .insertMany .find .update .remove .delete .updateMany .updateOne .removeOne .deleteOne
// the save event is triggered before a document is saved to the database
// we use a normal function so we can access the this keyword, which is the document that is being processed (saved)
// we created a empty slug in the schema to hold the slug of the tour
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//we can have multiple pre event hooks on the same event
// tourSchema.pre('save', function (next) {
//   console.log('will save document...');
//   next();
// });
// post middleware : it runs after the save method
//this is called a POST SAVE HOOK
// it has access to next and the document that was just saved to the database
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
