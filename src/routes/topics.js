const express = require("express");
const router = express.Router();

const topicController = require("../controllers/topicController.js");

router.get("/topics", topicController.index);

module.exports = router;
