import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

import { HttpError } from "../helpers/index.js";

import { userSigninSchema, userSignupSchema } from "../models/User.js";

const { JWT_SECRET } = process.env;

const signup = async (req, res, next) => {
  try {
    const validateResult = userSignupSchema.validate(req.body);

    if (validateResult.error) {
      throw HttpError(400, validateResult.error.message);
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw HttpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ ...req.body, password: hashPassword });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const signin = async (req, res, next) => {
  try {
    const validateResult = userSigninSchema.validate(req.body);

    if (validateResult.error) {
      throw HttpError(400, validateResult.error.message);
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(401, "Email or password is wrong");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw HttpError(401, "Email or password is wrong");
    }

    const { _id: id } = user;
    const payload = {
      id,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });

    res.json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  signup: signup,
  siingn: signin,
};
