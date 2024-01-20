const express = require('express');
const router = express.Router();
const User = require('../models/users');

const bcrypt = require('bcryptjs');
const {body,validationResult} =require('express-validator');
const jwt= require('jsonwebtoken');
const JWT_SECRET = 'Niranjan';

//Route 1: Create a User using POST "api/auth/signup". No login required
router.post('/signup', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isLength({ min: 3 }),
  body('contact', 'Enter a valid contact').isLength({ min: 10 }),
  body('password', 'Enter a password').isLength({ min: 6 })
], async (req, res) => {
  try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ error: "Validation error. Please check your input." });
      }

      let user = await User.findOne({ email: req.body.email });
      if (user) {
          return res.status(400).json({ error: "Sorry, a user with this email already exists." });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // Create a new user
      user = await User.create({
          name: req.body.name,
          email: req.body.email,
          contact: req.body.contact,
          password: secPass,
      });

      const data = {
          user: {
              id: user.id,
          }
      };

      const authToken = jwt.sign(data, JWT_SECRET);
      console.log(authToken);
      res.json({ authToken });

  } catch (error) {
      console.error(error);
      res.status(500).send("Some error occurred");
  }
});


// Route 2: Authenticate a User using POST "api/auth/login". No login required
router.post('/login', [
    body('email', 'Enter a valid email').isLength({ min: 8 }),
    body('password', 'Enter a password').isLength({ min: 8 })
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { email, password } = req.body;
      let user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
  
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
  
      const data = {
        user: {
          id: user.id,
        }
      };
  
      const authToken = jwt.sign(data, JWT_SECRET);
      console.log(authToken);
      res.json({ authToken });
    } catch (error) {
      console.error(error);
      res.status(500).send("Some error occurred");
    }
  });
  
  module.exports = router;