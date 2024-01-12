import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import fs from "fs/promises";
import path from "path";
import Jimp from "jimp";

import { HttpError } from "../helpers/index.js";

import User, {
  userSigninSchema,
  subscriptionSchema,
  userSignupSchema,
} from "../models/User.js";

import { ctrlWrapper } from "../decorators/index.js";

const avatarPath = path.resolve("public", "avatars");

const { JWT_SECRET } = process.env;

const signup = async (req, res) => {
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

  const avatarURL = gravatar.url(email);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const signin = async (req, res) => {
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
  await User.findByIdAndUpdate(id, { token });
  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const getCurrent = async (req, res) => {
  const { subscription, email } = req.user;

  res.json({
    email,
    subscription,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  console.log(_id);
  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).json({
    message: "No Content",
  });
};
const changeSubscription = async (req, res) => {
  const validateResult = subscriptionSchema.validate(req.body);

  if (validateResult.error) {
    throw HttpError(400, validateResult.error.message);
  }
  const { _id } = req.user;

  const result = await User.findOneAndUpdate(_id, req.body, {
    new: true,
  });
  if (!result) {
    throw HttpError(404, `Contact id:${id} not found`);
  }
  res.json(result);
};

const changeAvatar = async (req, res) => {
  const { _id, email } = req.user;

  const { path: oldPath, filename } = req.file;

  const newPath = path.join(avatarPath, filename);

  await fs.rename(oldPath, newPath);

  const avatarURL = path.join("avatars", filename);

  Jimp.read(newPath).then((file) => {
    file.resize(250, 250).write(`${avatarPath}/${Date.now()}_${email}.jpg`);
  });

  await fs.unlink(newPath);

  const result = await User.findByIdAndUpdate(
    _id,
    { avatarURL },
    { new: true }
  );

  if (!result) {
    throw HttpError(401, `Not authorized`);
  }
  res.json({ avatarURL });
};
export default {
  signup: ctrlWrapper(signup),
  signin: ctrlWrapper(signin),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  changeSubscription: ctrlWrapper(changeSubscription),
  changeAvatar: ctrlWrapper(changeAvatar),
};
