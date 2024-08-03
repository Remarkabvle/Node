import Joi from 'joi';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// User Schema
const userSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String, default: '' },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, default: 0 },
  url: { type: String, default: '' },
  gender: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  budget: { type: Number, default: 0 },
});

// Password hashing before saving the user
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const Users = mongoose.model('User', userSchema);

// Validation Schema
export const validateUser = (data) => {
  const schema = Joi.object({
    fname: Joi.string().required(),
    lname: Joi.string().allow(''),
    username: Joi.string().required(),
    password: Joi.string().required(),
    age: Joi.number().default(0),
    url: Joi.string().allow(''),
    gender: Joi.string().required(),
    isActive: Joi.boolean(),
    budget: Joi.number().default(0)
  });
  return schema.validate(data);
};
