import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Users, validationUser } from "../schema/userSchema.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const { limit = 10, skip = 1 } = req.query;
    const users = await Users.find()
      .limit(limit)
      .skip(limit * (skip - 1));
    if (!users.length) {
      return res.status(400).json({
        msg: "Users is not defined",
        variant: "warning",
        payload: null,
      });
    }
    const total = await Users.countDocuments();
    res.status(200).json({
      msg: "All Users",
      variant: "success",
      payload: users,
      total,
    });
  } catch {
    res.status(500).json({
      msg: "Server error",
      variant: "error",
      payload: null,
    });
  }
});

router.post("/sign-up", async (req, res) => {
  try {
    let { error } = validationUser(req.body);
    if (error) {
      return res.status(400).json({
        msg: error.details[0].message,
        variant: "error",
        payload: null,
      });
    }
    const existUser = await Users.exists({ title: req.body.username });
    if (existUser) {
      return res.status(400).json({
        msg: "This username has been used",
        variant: "warning",
        payload: null,
      });
    }

    req.body.password = await bcrypt.hash(req.body.password, 10);
    const user = await Users.create(req.body);
    res.status(201).json({
      msg: "User is created",
      variant: "success",
      payload: user,
    });
  } catch {
    res.status(500).json({
      msg: "Server error",
      variant: "error",
      payload: null,
    });
  }
});

router.post("/sign-in", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Users.findOne({ username });

    if (!user) {
      return res.status(400).json({
        msg: "username xato ",
        variant: "error",
        payload: null,
      });
    }

    bcrypt.compare(password, user.password, function (err, response) {
      const token = jwt.sign(
        { _id: user._id, role: "admin" },
        process.env.SECRET_KEY
      );
      if (response) {
        res.status(200).json({
          msg: "Log in ",
          variant: "success",
          payload: user,
          token,
        });
      } else {
        return res.status(400).json({
          msg: "password is wrong",
          variant: "error",
          payload: null,
        });
      }
    });
  } catch {
    res.status(500).json({
      msg: "Server error",
      variant: "error",
      payload: null,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const existUser = await Users.findById(id);
    if (!existUser) {
      return res.status(400).json({
        msg: "User is not defined",
        variant: "warning",
        payload: null,
      });
    }
    const user = await Users.findByIdAndDelete(id, { new: true });

    res.status(200).json({
      msg: "user is deleted",
      variant: "success",
      payload: user,
    });
  } catch {
    res.status(500).json({
      msg: "Server error",
      variant: "error",
      payload: null,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Users.findByIdAndUpdate(id, req.body, { new: true });

    res.status(200).json({
      msg: "User is updated",
      variant: "success",
      payload: user,
    });
  } catch {
    res.status(500).json({
      msg: "Server error",
      variant: "error",
      payload: null,
    });
  }
});

export default router;
