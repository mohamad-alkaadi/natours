const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
//create a schema and create a model out of it
//we dont want username for this app we can do it but this app want to identify users by email
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    //transfer email into lowercase
    lowercase: true,
    //validate email in the form of mohamad@gmail.com so we are going to use a validator from npm
    // we pass the function and the error message
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  //  if the user wants to upload a photo, then that will be stored somewhere in our file system and the oath to that photo will then be stored into the photo field
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    //we want to create our validator function to check if the password and passwordConfirm are the same
    //we want to specify a new callback function that will be called when the new document is created
    //we don't use a validator function because we want to use the this keyword
    // in the validator function if the return is false this means that we are going to get a validation error
    validate: {
      // this will only works on CREATE and SAVE!!!
      // ex: User.save and User.create
      // if we want to update we cant use findByIdAndUpdate because it wil not run this validator
      validator: function (el) {
        return el === this.password; //this.password is the password field
      },
      message: 'Passwords are not the same!',
    },
  },
});

//to incript the password we incrpt irt on the model so we can keep the thin controller and fat model concept
// we use the pre hook to encrypt the password before it is saved to the database
// the pre middle is in the moment between the data is sent and save in the database
// so it is the perfect tme to do so
// it will run on the save and create method
userSchema.pre('save', async function (next) {
  //------------ Only run this function is password is modified ------------------
  // if password is not modified  we exit the function
  if (!this.isModified('password')) return next();

  //------------ Hash this password with the cost of 12 ------------------

  //no we hash the password, we use a very well known algorithm called bcrypt
  //it will protect us against route force attacks because they are affective when the encryption is bad
  // first it will salt our password: that means it will add a random string to the password so that two equal passwords do not generate the same hash
  // first parameter is the password and the secund is cost parameter
  // we can do this in two ways : first we can do it manually generating the salt so that random string is going to be added to our password and then use that salt in the hash function
  // or we can make it easier by passing a cost parameter into the function
  // this is a measure of how CPU intensive this operation will be
  // the default is 10 bit it is more better to use 12 because computers is faster nowadays
  // the higher the number is the more cpu intensive it will be and the better the password will be encrypted
  // the hash function is the asyncrounas function and this will return a promise that we want to await
  this.password = await bcrypt.hash(this.password, 12);

  //------------ Delete passwordConfirm field ------------------

  // now we want to delete the confirm password
  this.passwordConfirm = undefined;
  next();
});

// create Model out of the Schema
const User = mongoose.model('User', userSchema);

module.exports = User;
