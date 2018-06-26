const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Models
const Profile = require("../../models/Profile");
const User = require("../../models/User");
// Validation
const validateProfileInput = require("../validation/profile");

// @route       GET api/profile/tests
// @desc        Tests profile route
// @access      Public
router.get("/test", (req, res) => res.json({ msg: "PROFILE ROUTE ONLINE" }));

// @route       GET api/profile
// @desc        Get current users profile
// @access      Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.secure.id })
      .then(profile => {
        if (profile) {
          res.json(profile);
        } else {
          errors.noProfile = "No profile exists for that user, sorry, dude.";
          return res.status(404).json(errors);
        }
      })
      .catch(error => res.status(404).json(error));
  }
);

// @route       POST api/profile
// @desc        Create/Edit user profile
// @access      Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // Check validation
    if (!isValid) {
      // Return errors with 400 status
      return res.status(400).json(errors);
    }

    // Get fields from post request
    // Empty obj to store profile info
    const profileFields = {};
    // Get user information based on the logged in users id
    profileFields.user = req.user.id;

    // See if each field exists in the request body
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githibusername)
      profileFields.githibusername = req.body.githibusername;
    // Skills - split into array of CSV
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }
    // Social
    // Create empty social object then parse the data from req.body for each social media
    // Set each profileField for each social media platform
    profileFields.social = {};
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;

    // Find one where the current users id = user
    Profile.findOne({ user: req.user.id }).then(profile => {
      // If the profile exists
      if (profile) {
        // Update the profule for the current user
        Profile.findOneAndUpdate(
          { user: req.user.id },
          // Set the schema to the data from profileFields
          { $set: profileFields },
          { new: true }
          // Send the updated profile
        ).then(profile => res.json(profile));
      } else {
        // Create
        // Check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          // If there's a profile associated with the handle, send error
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }

          // Save Profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

module.exports = router;
