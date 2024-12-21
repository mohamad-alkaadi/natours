// instead of writing try catch blocks for each code with same error handling
//we write a function for handling errors
//this function is for catching async errors
// fn means we are passing a function
//async functions return promises and if there is anything wrong we get an error so we can catch that error
//we can catch the error in the function instead of doing it over and over again in all the route handlers
//for createTour to not be the result of calling the function catchAsync so we need to make catchAsync return a function
// if we wrote only  fn(req, res, next).catch((err) => next(err)); it will return the result of the function
//and it will not have any idea what is req, res, next so we need to make it return a function
// to return an anonymous function "function without a name" we write return (params) => { code }
// instead of writing catch((err) => next(err)) we can write only catch(next) and it will pass it error by itself

module.exports = (fn) => {
  return (req, res, next) => {
    //if there is an error it will catch it
    fn(req, res, next).catch((err) => next(err));
  };
};
