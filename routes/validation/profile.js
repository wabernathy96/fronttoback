const Validator = require("validator");
const isEmpty = require("../../helpers/is-empty");

// Var data is an obj of stuff to validate
module.exports = function validateProfileInput(data) {
  // Set errors to empty object
  // If everything goes right, should remain empty to end
  let errors = {};

  // Check if the field is empty - if it is, set the default value to an empty string (so Validator can use it)
  // Otherwise, take input
  data.handle = !isEmpty(data.handle) ? data.handle : "";
  data.status = !isEmpty(data.status) ? data.status : "";
  data.skills = !isEmpty(data.skills) ? data.skills : "";

  if (!Validator.isLength(data.handle, { min: 4, max: 40 })) {
    errors.handle = "Handle must be between 4 and 40 characters";
  }

  if (Validator.isEmpty(data.handle)) {
    errors.handle = "Handle is required";
  }
  if (Validator.isEmpty(data.status)) {
    errors.status = "Status field is required";
  }
  if (Validator.isEmpty(data.skills)) {
    errors.skills = "Skills field is required";
  }

  // If the respective url fields arent empty
  // Validate the posted url
  if (!isEmpty(data.website)) {
    if (!Validator.isURL(data.website)) {
      errors.website = "Invalid URL";
    }
  }
  if (!isEmpty(data.linkedin)) {
    if (!Validator.isURL(data.linkedin)) {
      errors.linkedin = "Invalid URL";
    }
  }
  if (!isEmpty(data.facebook)) {
    if (!Validator.isURL(data.facebook)) {
      errors.facebook = "Invalid URL";
    }
  }
  if (!isEmpty(data.twitter)) {
    if (!Validator.isURL(data.twitter)) {
      errors.twitter = "Invalid URL";
    }
  }
  if (!isEmpty(data.instagram)) {
    if (!Validator.isURL(data.instagram)) {
      errors.instagram = "Invalid URL";
    }
  }
  if (!isEmpty(data.youtube)) {
    if (!Validator.isURL(data.youtube)) {
      errors.youtube = "Invalid URL";
    }
  }

  // Return object with any errors, check if there arent any errors
  // If errors object isempty - user input is valid
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
