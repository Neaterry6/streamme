const bcrypt = require("bcrypt");
const User = require("../models/User");
const { generateToken } = require("../utils/token");

exports.signup = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.pass, 10);
    const user = new User({ username: req.body.user, password: hashedPassword });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({ message: "User created", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.user });
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(req.body.pass, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const token = generateToken(user._id);
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};