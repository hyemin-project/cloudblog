const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
require('dotenv').config();

const router = express.Router();

// Login Route
router.post('/login', async (req, res) => {
  console.log('Login attempt received:', req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('Stored hashed password:', user.password);

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user: { userId: user.id, email: user.email, role: user.role, username: user.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An unexpected error occurred', details: error.message });
  }
});

// Registration Route
router.post('/register', async (req, res) => {
  console.log('Registration attempt received:', req.body);
  const { email, password, username } = req.body;

  try {
    let user = await User.findOne({ where: { email } });
    if (user) {
      console.log('User already exists');
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    console.log('Salt generated:', salt);

    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Hashed password:', hashedPassword);

    user = await User.create({
      email,
      username,
      password: hashedPassword,
      role: 'user'
    });
    console.log('User created:', user.toJSON());

    // Verify stored password
    const retrievedUser = await User.findOne({ where: { email } });
    console.log('Retrieved user:', retrievedUser.toJSON());

    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;