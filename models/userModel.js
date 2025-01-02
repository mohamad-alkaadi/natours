const mongoose = require('mongoose');
const validator = require('validator');
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
  },
});

// create Model out of the Schema
const User = mongoose.model('User', userSchema);

module.exports = User;
