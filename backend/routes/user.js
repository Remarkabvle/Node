import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Users, validateUser } from '../schema/userSchema.js';

const router = express.Router();

// Middleware for authentication
const authenticate = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'Access denied. No token provided.', variant: 'error', payload: null });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ msg: 'Invalid token.', variant: 'error', payload: null });
  }
};

// Get all users with pagination
router.get('/', authenticate, async (req, res) => {
  try {
    const { limit = 10, skip = 1 } = req.query;
    const users = await Users.find().limit(limit).select('-password').skip(limit * (skip - 1));
    const total = await Users.countDocuments();

    if (!users.length) {
      return res.status(404).json({ msg: 'No users found.', variant: 'warning', payload: null });
    }

    res.status(200).json({ msg: 'All users', variant: 'success', payload: users, total });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', variant: 'error', payload: null });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message, variant: 'error', payload: null });

  const { username, password } = req.body;
  const existingUser = await Users.findOne({ username });
  if (existingUser) return res.status(400).json({ msg: 'Username already in use', variant: 'warning', payload: null });

  const user = new Users(req.body);
  await user.save();

  // Create and send token
  const token = jwt.sign({ _id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.status(201).json({ msg: 'User created', variant: 'success', payload: { user, token } });
});

// Delete a user
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const user = await Users.findByIdAndDelete(id);

  if (!user) return res.status(404).json({ msg: 'User not found', variant: 'warning', payload: null });

  res.status(200).json({ msg: 'User deleted', variant: 'success', payload: user });
});

// Update a user
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  const { error } = validateUser(req.body, { context: { isUpdate: true } });
  if (error) return res.status(400).json({ msg: error.details[0].message, variant: 'error', payload: null });

  const user = await Users.findByIdAndUpdate(id, req.body, { new: true });
  if (!user) return res.status(404).json({ msg: 'User not found', variant: 'warning', payload: null });

  res.status(200).json({ msg: 'User updated', variant: 'success', payload: user });
});

export default router;
