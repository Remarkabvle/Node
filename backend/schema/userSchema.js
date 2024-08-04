import Joi from "joi";
import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: false,
    default: "",
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: false,
    default: 0,
  },
  url: {
    type: String,
    required: false,
    default: "",
  },
  gender: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: false,
    default: true,
  },
  budget: {
    type: Number,
    required: true,
  },
});

export const Users = mongoose.model("user", userSchema);

export const validationUser = (body) => {
  let schema = Joi.object({
    fname: Joi.string().required(),
    lname: Joi.string().allow(""),
    username: Joi.string().required(),
    password: Joi.string().required(),
    age: Joi.number().allow(0),
    url: Joi.string().allow(""),
    gender: Joi.string().required(),
    isActive: Joi.boolean(),
    budget: Joi.number().allow(0),
  });
  return schema.validate(body);
};
