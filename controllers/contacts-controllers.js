import Contact from "../models/Contact.js";

import { HttpError } from "../helpers/index.js";

import {
  contactAddSchema,
  contactUpdateSchema,
  contactUpdateFavoriteSchema,
} from "../models/Contact.js";

import { ctrlWrapper } from "../decorators/index.js";

const getAll = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 20, favorite = null } = req.query;
  const skip = (page - 1) * limit;
  const filter = { owner };
  if (favorite || favorite === false) {
    filter.favorite = favorite;
  }
  const result = await Contact.find(filter, "-createdAt -updatedAt", {
    skip,
    limit,
  }).populate("owner", "email subscription");
  res.json(result);
};

const getById = async (req, res) => {
  const { id: _id } = req.params;
  const { _id: owner } = req.user;

  const foundContactById = await Contact.findOne({ _id, owner });
  if (!foundContactById) {
    throw HttpError(404, `Contact with id=${id} not found`);
  }
  res.json(foundContactById);
};

const add = async (req, res) => {
  const validateResult = contactAddSchema.validate(req.body);

  if (validateResult.error) {
    throw HttpError(400, validateResult.error.message);
  }
  const { _id: owner } = req.user;
  const result = await Contact.create({ ...req.body, owner });
  res.status(201).json(result);
};

const updateById = async (req, res) => {
  const validateResult = contactUpdateSchema.validate(req.body);

  if (validateResult.error) {
    throw HttpError(400, validateResult.error.message);
  }
  const { _id: owner } = req.user;

  const { id: _id } = req.params;
  const result = await Contact.findOneAndUpdate({ _id, owner }, req.body, {
    new: true,
  });
  if (!result) {
    throw HttpError(404, `Contact id:${id} not found`);
  }
  res.json(result);
};

const updateStatusContact = async (req, res) => {
  const validateResult = contactUpdateFavoriteSchema.validate(req.body);

  if (validateResult.error) {
    throw HttpError(400, validateResult.error.message);
  }

  const { _id: owner } = req.user;

  const { id: _id } = req.params;

  const result = await Contact.findOneAndUpdate({ _id, owner }, req.body, {
    new: true,
  });
  if (!result) {
    throw HttpError(404, `Contact id:${id} not found`);
  }
  res.json(result);
};

const deleteById = async (req, res) => {
  const { id: _id } = req.params;
  const { _id: owner } = req.user;

  const result = await Contact.findOneAndDelete({ _id, owner });
  if (!result) {
    throw HttpError(404, `Contact id:${id} not found`);
  }
  res.json({
    message: "Contact deleted",
  });
};

export default {
  getAll: ctrlWrapper(getAll),
  getById: ctrlWrapper(getById),
  add: ctrlWrapper(add),
  updateById: ctrlWrapper(updateById),
  updateStatusContact: ctrlWrapper(updateStatusContact),
  deleteById: ctrlWrapper(deleteById),
};
