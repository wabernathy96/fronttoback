const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

// Load User Model
const User = require("../../models/User");

// Load Input Validation
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");

// @route       GET api/users/tests
// @desc        Tests users route
// @access      Public
router.get("/test", (req, res) => res.json({ msg: "USERS ROUTE ONLINE" }));

// @route       GET api/users/register
// @desc        Register users
// @access      Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  // Get body of request from post then email
  User.findOne({ email: req.body.email }).then(user => {
    // If the email exists
    if (user) {
      errors.email = "Hey, that email is already in use.";
      // Send error
      return res.status(400).json(errors);
    } else {
      // Get the gravatar avatar associated with the email
      const avatar = gravatar.url(req.body.email, {
        s: "200", // Size
        r: "pg", // Rating
        d: "mm" // Default
      });

      // Set the newUser object
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      // Generate salt w bcrypt
      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        // Hash password with salt
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;

          newUser.password = hash; // Set password to hash

          newUser
            .save() // Save newUser to db
            .then(user => res.json(user))
            .catch(err => res.json(err));
        });
      });
    }
  });
});

// @route       GET api/users/login
// @desc        Login user && Return JSON Web Token (JWT)
// @access      Public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email })
    .then(user => {
      // Check for user
      if (!user) {
        errors.email = "User not found.. Double check your email";
        return res.status(404).json({ errors });
      }

      // Check Password - compare password from above w password in db
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // User Matched
          // Create JWT payload
          const payload = {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          };
          // Sign Token
          jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 86400 },
            (err, token) => {
              res.json({
                success: true,
                token: `Bearer ${token}`
              });
            }
          );
        } else {
          return res.status(400).json({ password: "Password incorrect" });
        }
      });
    })
    .catch(err => res.send(err));
});

// @route       GET api/users/current
// @desc        Return current user // Person w JWT
// @access      Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
