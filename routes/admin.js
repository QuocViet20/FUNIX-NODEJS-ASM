const express = require("express");

const router = express.Router();
const Staff = require("../models/staff");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const { check, body } = require("express-validator/check");

// // /admin/add-staff => GET
router.get("/add-staff", isAuth, adminController.getAddStaff);

// /admin/staffs => GET
router.get("/adminManager", isAuth, adminController.getAdminManager);

// admin/listStaffs Get
router.get("/listStaffs", isAuth, adminController.getListStaffs);

// // /admin/add-staff => POST
router.post(
  "/add-staff",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value) => {
        return Staff.findOne({ email: value }).then((staffDoc) => {
          if (staffDoc) {
            return Promise.reject(
              "E-Mail exists already, please pick a different one."
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 6 characters"
    )
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("passwords have to match");
        }
        return true;
      }),
    body(
      "name",
      "Please enter a name with only numbers and text and at least 5 characters"
    )
      .isString()
      .isLength({ min: 5 })
      .trim(),
    body("doB").not().isEmpty(),
    body("startDate").not().isEmpty(),
    body("salaryScale").isFloat(),
    body("annualLeave").isNumeric(),
  ],

  adminController.postAddStaff
);

// // /admin/edit-staff => POST
router.post(
  "/edit-staff",
  [
    body(
      "name",
      "Please enter a name with only numbers and text and at least 5 characters"
    )
      .isString()
      .isLength({ min: 5 })
      .trim(),
    body("doB").not().isEmpty(),
    body("startDate").not().isEmpty(),
    body("salaryScale").isFloat(),
    body("annualLeave").isNumeric(),
  ],
  isAuth,
  adminController.postEditStaff
);

router.get("/covidStaffs", isAuth, adminController.getCovidStaffs);
// getStaffInfoCovid Get
router.get("/staff/:staffId", isAuth, adminController.getStaffInfoCovid);
// getStaffInfoCovid GetPdf
router.get(
  "/staffCovid/:staffId",
  isAuth,
  adminController.getPdfStaffInfoCovid
);
// get staffInfo GET

router.get("/staff/infomation/:staffId", isAuth, adminController.getStaffInfo);

// get staffSession GET
router.get("/staff/session/:staffId", isAuth, adminController.getStaffSession);

// deleteSession POST
router.post("/delete-session", isAuth, adminController.postDeleteSession);

// confirmSession POST
router.post("/confirm-session", isAuth, adminController.postConfirmSession);

// detailMonth POST
router.post("/staff/detailMonth", isAuth, adminController.postDetailMonth);

// get editStaff
router.get("/edit-staff/:staffId", isAuth, adminController.getEditStaff);

// delete Staff
router.post("/delete-staff", isAuth, adminController.postDeleteStaff);

module.exports = router;
