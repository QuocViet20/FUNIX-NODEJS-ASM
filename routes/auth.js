const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth");
const { check, body } = require("express-validator/check");

// login => GET
router.get("/login", authController.getLogin);

// /postlogin => POST
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .normalizeEmail(),
    body("password", "Password has to be valid.")
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);

// /postLogout => POST
router.post("/logout", authController.postLogout);

module.exports = router;
