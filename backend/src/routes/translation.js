const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const translationController = require("../controllers/translationController");
const { protect } = require("../middleware/auth");

// @route   POST /api/translation/translate
// @desc    Translate text between languages
// @access  Private
router.post(
  "/translate",
  protect,
  [
    body("text").notEmpty().withMessage("Text is required"),
    body("from").isIn(["en", "hi"]).withMessage("Invalid source language"),
    body("to").isIn(["en", "hi"]).withMessage("Invalid target language"),
  ],
  translationController.translateText
);

module.exports = router;
