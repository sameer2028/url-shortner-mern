const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "your_super_secret_key_123"; // In production, put this in a .env file!

async function handleUserSignup(req, res) {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashedPassword });
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    return res.status(400).json({ error: "Email already exists or invalid data" });
  }
}

async function handleUserLogin(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Create a token that expires in 24 hours
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, email: user.email });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { handleUserSignup, handleUserLogin };