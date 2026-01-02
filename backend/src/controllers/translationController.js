const { validationResult } = require("express-validator");
const logger = require("../utils/logger");

// Simple translation dictionary (in production, use a proper translation API)
const translations = {
  en: {
    hi: {
      Emergency: "आपातकाल",
      Ambulance: "एम्बुलेंस",
      Fire: "आग",
      Police: "पुलिस",
      Accident: "दुर्घटना",
      Medical: "चिकित्सा",
      Help: "मदद",
      Location: "स्थान",
      Status: "स्थिति",
    },
  },
  hi: {
    en: {
      आपातकाल: "Emergency",
      एम्बुलेंस: "Ambulance",
      आग: "Fire",
      पुलिस: "Police",
      दुर्घटना: "Accident",
      चिकित्सा: "Medical",
      मदद: "Help",
      स्थान: "Location",
      स्थिति: "Status",
    },
  },
};

// @desc    Translate text
// @route   POST /api/translation/translate
// @access  Private
exports.translateText = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { text, from, to } = req.body;

    if (from === to) {
      return res.json({
        success: true,
        translation: text,
        from,
        to,
      });
    }

    // Simple word-by-word translation (in production, use Google Translate API or similar)
    let translatedText = text;

    if (translations[from] && translations[from][to]) {
      const dictionary = translations[from][to];

      // Split by words and translate
      const words = text.split(" ");
      const translatedWords = words.map((word) => {
        const cleanWord = word.trim();
        return dictionary[cleanWord] || cleanWord;
      });

      translatedText = translatedWords.join(" ");
    }

    logger.info(`Translation: ${from} -> ${to}`);

    res.json({
      success: true,
      translation: translatedText,
      original: text,
      from,
      to,
    });
  } catch (error) {
    logger.error(`Translation error: ${error.message}`);
    next(error);
  }
};
