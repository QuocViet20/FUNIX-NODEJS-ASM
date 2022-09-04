const express = require("express");

const router = express.Router();

const adminController = require("../controllers/admin");

// // /admin/add-staff => GET
router.get("/add-staff", adminController.getAddStaff);

// /admin/staffs => GET
router.get("/staffs", adminController.getStaffs);

// // /admin/add-staff => POST
router.post("/add-staff", adminController.postAddStaff);

module.exports = router;
