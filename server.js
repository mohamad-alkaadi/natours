// a good practace to make everything related to express in a file and everything related to the server in another
// everything that is not related to express we do it outside of app.js
// we also use database configurations, error handling, or environment variables
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// the connect will return a promise
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection successful');
  });

// a model is like a blueprint that we use to create documents
// we create a model in mongoose in order to create documents using it and also to query, update and delete these documents (CRUD)
// we create models out of mongoose schema
// we use a schema to describe our data, to set default values, to validate the data, etc...

const tourSchema = new mongoose.Schema({
  name: {
    // schema type options
    type: String,
    required: true,
    unique: true,
  },
  // we can also set default values

  rating: { type: Number, default: 4.5 },
  price: {
    type: Number,
    // to specify what error will be displayed when we are missing this field
    // first in the array if required is active or not, second if array is the error that will be displayed
    // this is called data validation
    required: [true, 'A true must have a name'],
  },
});

// now we create a model out of it
// it should start with upper case
const Tour = mongoose.model('Tour', tourSchema);

// to create a new document
// testTour document is an instance of the Tour model
const testTour = new Tour({
  name: ' The Forest Hiker',
  rating: 4.7,
  price: 497,
});

// in order to save the document to the database
// the save() will return a promise tat can be consumed with then()
// the resolve value of the promise is the final document as it is in the database.
testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => console.log('ERROR:', err));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app running ono port ${port}`);
});
