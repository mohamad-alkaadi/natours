// to make error responding easer we make a custom error
// we made a class for errors that extendes the javascript errors and we want to add to it
// and from now we can use this app error to create all the errors in our application
class AppError extends Error {
  // the constractor method is called each time we create a new object out of this class
  constructor(message, statusCode) {
    // when we extend parent classes we call super in order to call the parent constructor
    // message is the only parameter the the built in Error class accepts
    super(message);

    this.statusCode = statusCode;
    //we convert the status code into a string so we can compare if error is 400 errors or 500 errors
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // we want to make a property to specify if the error is operational
    this.isOperational = true;
    //first we specify the current object and the AppError itself
    // when a new object is created and a constructor function is called
    // then that function call is not gonna appear in the a stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
