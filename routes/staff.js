const express = require("express");

const router = express.Router();

const staffController = require("../controllers/staff");
const isAuth = require("../middleware/is-auth");
const { check, body } = require("express-validator/check");

router.get("/", isAuth, staffController.getStaff);

// getStaff/start =>Get

router.get("/start", isAuth, staffController.getStaffStart);

router.post("/add-session", isAuth, staffController.postAddSession);

//getSession

router.get("/startCheckIn", isAuth, staffController.getStaffCheckIn);

router.post("/update-session", isAuth, staffController.updateSession);

// get sessions
router.get("/sessions", isAuth, staffController.getSessions);

//get formDayoff
router.get("/formDayoff", isAuth, staffController.getFormDayoff);

// post annualLeave
router.post(
  "/add-annualLeave",
  [
    body("dayOff").not().isEmpty(),
    body("quantityDayoffs").isNumeric(),
    body("reason").isString().isLength({ min: 5 }).trim(),
  ],
  isAuth,
  staffController.postAddAnnualLeav
);

router.get("/dayoff", isAuth, staffController.getDayoff);

// get staffInfo
router.get("/information", isAuth, staffController.getStaffInfo);

//updateimage POST
router.post("/staff-updateImage", isAuth, staffController.staffUpdateImage);

// get infoSessions GET
router.get("/infoSessions", isAuth, staffController.getInfoSessions);

router.post("/salaryMonth", isAuth, staffController.postSalaryMonth);

// get formCovidInfo
router.get("/form-covidInfo", isAuth, staffController.getFormCovidInfo);

// post CovidInfo
router.post("/add-covidInfo", isAuth, staffController.postAddCovidInfo);

// get covidInfo =>GET
router.get("/covidInfo", isAuth, staffController.getCovidInfo);

module.exports = router;
