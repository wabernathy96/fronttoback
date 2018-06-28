const Validator = require("validator");
const isEmpty = require("../../helpers/is-empty");

// Var data is an obj of stuff to validate
module.exports = function validateEducationInput(data) {
  // Set errors to empty object
  // If everything goes right, should remain empty to end
  let errors = {};

  // Check if the field is empty - if it is, set the default value to an empty string (so Validator can use it)
  // Otherwise, take input
  data.school = !isEmpty(data.school) ? data.school : "";
  data.degree = !isEmpty(data.degree) ? data.degree : "";
  data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : "";
  data.from = !isEmpty(data.from) ? data.from : "";

  if (Validator.isEmpty(data.school)) {
    errors.school = "School field is required";
  }
  if (Validator.isEmpty(data.degree)) {
    errors.degree = "Degree field is required";
  }
  if (Validator.isEmpty(data.fieldofstudy)) {
    errors.fieldofstudy = "Field of study is required";
  }
  if (Validator.isEmpty(data.from)) {
    errors.from = "From-date field is required";
  }

  // Return object with any errors, check if there arent any errors
  // If errors object isempty - user input is valid
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
