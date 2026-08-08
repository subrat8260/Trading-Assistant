/**
 * Catch async errors and forward them to express next() error middleware
 * @param {Function} fn Async controller function
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
