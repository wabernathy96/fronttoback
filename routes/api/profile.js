const express = require("express");
const router = express.router();

// @route       GET api/profile/tests
// @desc        Tests profile route
// @access      Public
router.get("/test", (req, res) => res.json({ msg: "PROFILE ROUTE ONLINE" }));

module.exports = router;
