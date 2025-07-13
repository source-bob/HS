import { validationResult } from "express-validator";

const customError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
}

const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error); // forward error to error handler
};
/**
* Custom default middleware for handling errors
*/
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500); // default is 500 if err.status is not defined
  res.json({
    message: err.message,
    status: err.status || 500,
    errors: err.errors,
  });
};

const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req, {strictParams: ['body']});
  if (!errors.isEmpty()) {
    const error = new Error('bad request');
    error.status = 400;
    error.errors = errors.array({onlyFirstError: true}).map((error) => {
      return {field: error.path, message: error.msg};
    });
    console.log('ERROR!:', errors);
    return next(error);
  }
  next();
};


export { notFoundHandler, errorHandler, validationErrorHandler, customError }
