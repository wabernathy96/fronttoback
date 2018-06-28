const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Models
const Profile = require("../../models/Profile");
const User = require("../../models/User");
// Validation
const validateProfileInput = require("../validation/profile");
const validateExperienceInput = require("../validation/experience");
const validateEducationInput = require("../validation/education");

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
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (profile) {
          res.json(profile);
        } else {
          errors.noProfile = "No profile exists for that user, sorry, dude.";
          return res.status(404).json(errors);
        }
      })
      .catch(err =>
        res
          .status(404)
          .json({ profile: "No profile exists for that user, sorry, dude." })
      );
  }
);

// @route       GET api/profile/handle/:handle
// @desc        Get profile by handle
// @access      Public
router.get("/handle/:handle", (req, res) => {
  const errors = {};
  // Match :handle from url to handle from db
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noProfile = "No profile exists for that handle, sorry, dude.";
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err =>
      res
        .status(404)
        .json({ profile: "No profile exists for that handle, sorry, dude." })
    );
});

// @route       GET api/profile/user/:user_id
// @desc        Get profile by id
// @access      Public
router.get("/user/:user_id", (req, res) => {
  const errors = {};

  // Match :user_id from url to user_id from db
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noProfile = "No profile exists for that user, sorry, dude.";
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err =>
      res
        .status(404)
        .json({ profile: "No profile exists for that user, sorry, dude." })
    );
});

// @route       GET api/profile/all
// @desc        Get all profiles
// @access      Public
router.get("/all", (req, res) => {
  const errors = {};

  // Find all profiles
  Profile.find({})
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noProfile = "Sorry, dude, no profiles currently exist";
        return res.status(404).json(errors);
      }

      res.json(profiles);
    })
    .catch(err =>
      res
        .status(404)
        .json({ profiles: "Sorry, dude, no profiles currently exist" })
    );
});

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

// @route       POST api/profile/experience
// @desc        Add experience to profile
// @access      Private

router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const { errors, isValid } = validateExperienceInput(req.body);

        // Check validation
        if (!isValid) {
          // Return errors with 400 status
          return res.status(400).json(errors);
        }

        profile.experience = [];

        const newExperience = {
          title: req.body.title,
          company: req.body.company,
          location: req.body.location,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };

        // Add newExperience to experience arr
        // unshift = add to beginning
        profile.experience.unshift(newExperience);

        profile.save().then(profile => res.json(profile));
      })
      .catch(err =>
        res.status(400).json({ experience: "The experience post failed :-(" })
      );
  }
);

// @route       POST api/profile/education
// @desc        Add education to profile
// @access      Private

router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const { errors, isValid } = validateEducationInput(req.body);

        // Check validation
        if (!isValid) {
          // Return errors with 400 status
          return res.status(400).json(errors);
        }

        profile.education = [];

        const newEducation = {
          school: req.body.school,
          degree: req.body.company,
          fieldofstudy: req.body.location,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };

        // Add newEducation to education arr
        // unshift = add to beginning
        profile.education.unshift(newEducation);

        profile.save().then(profile => res.json(profile));
      })
      .catch(err =>
        res.status(400).json({ education: "The education post failed :-(" })
      );
  }
);

module.exports = router;
