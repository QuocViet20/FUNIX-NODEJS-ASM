const Staff = require("../models/staff");

exports.getAddStaff = (req, res, next) => {
  res.render("admin/edit-staff", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
  });
};

exports.getStaffs = (req, res, next) => {
  Staff.find()
    // Product.findAll()
    .then((staffs) => {
      res.render("admin/staffs", {
        staffs: staffs,
        pageTitle: "Admin Staffs",
        path: "/admin/staffs",
      });
    })
    .catch((err) => console.log(err));
};

exports.postAddStaff = (req, res, next) => {
  const name = req.body.name;
  const doB = req.body.doB;
  const startDate = req.body.startDate;
  const department = req.body.department;
  const salaryScale = req.body.salaryScale;
  const annualLeave = req.body.annualLeave;
  const imageUrl = req.body.imageUrl;
  const staff = new Staff({
    name: name,
    doB: doB,
    startDate: startDate,
    department: department,
    salaryScale: salaryScale,
    annualLeave: { leffDayOff: annualLeave, dayOffs: [] },
    imageUrl: imageUrl,
  });
  staff
    .save()
    .then((result) => {
      // console.log(result);
      console.log("created staff");
      res.redirect("/admin/staffs");
    })
    .catch((err) => console.log(err));
};
