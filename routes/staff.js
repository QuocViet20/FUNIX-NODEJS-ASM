const express = require("express");

const router = express.Router();

const staffController = require("../controllers/staff");

router.get("/", staffController.getStaff);

// getStaff/start =>Get

router.get("/start", staffController.getStaffStart);

router.post("/add-session", staffController.postAddSession);

//getSession

router.get("/startCheckIn", staffController.getStaffCheckIn);

router.post("/update-session", staffController.updateSession);

// get sessions
router.get("/sessions", staffController.getSessions);

//get formDayoff
router.get("/formDayoff", staffController.getFormDayoff);

// post annualLeave
router.post("/add-annualLeave", staffController.postAddAnnualLeav);

router.get("/dayoff", staffController.getDayoff);

// get staffInfo
router.get("/information", staffController.getStaffInfo);

//updateimage POST
router.post("/staff-updateImage", staffController.staffUpdateImage);

// get infoSessions GET
router.get("/infoSessions", staffController.getInfoSessions);

router.post("/salaryMonth", staffController.postSalaryMonth);

// get formCovidInfo
router.get("/form-covidInfo", staffController.getFormCovidInfo);

// post CovidInfo
router.post("/add-covidInfo", staffController.postAddCovidInfo);

// get covidInfo =>GET
router.get("/covidInfo", staffController.getCovidInfo);

module.exports = router;
