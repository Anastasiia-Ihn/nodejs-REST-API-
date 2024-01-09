import { HttpError } from "../helpers/index.js";

const isEmptyFile = (req, res, next) => {
  const { length } = Object.keys(req.file);
  if (!length) {
    return next(HttpError(400, "missing fields"));
  }
  next();
};

export default isEmptyFile;
