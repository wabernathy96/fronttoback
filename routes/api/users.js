const express = require("express");
const router = express.router();

// @route       GET api/users/tests
// @desc        Tests users route
// @access      Public
router.get("/test", (req, res) => res.json({ msg: "USERS ROUTE ONLINE" }));

module.exports = router;
