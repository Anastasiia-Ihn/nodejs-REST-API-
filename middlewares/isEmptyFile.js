import { HttpError } from "../helpers/index.js";

const isEmptyFile = (req, res, next) => {
  console.log(req.file);
  if (!req.file) {
    return next(HttpError(400, "Image required"));
  }
  next();
};

export default isEmptyFile;
