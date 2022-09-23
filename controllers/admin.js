const fs = require("fs");
const path = require("path");

const PDFDocument = require("pdfkit");

const Staff = require("../models/staff");
const Session = require("../models/session");
const CovidInfo = require("../models/covidInfo");
const RedirectLink = require("../models/redirectLink");

const brcypt = require("bcryptjs");
const { validationResult } = require("express-validator/check");

const ITEMS_PER_PAGE = 3;

exports.getAddStaff = (req, res, next) => {
  const updateLink = "/admin/add-staff";
  RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
    rDLink.updateLink(updateLink);
  });
  res.render("admin/edit-staff", {
    pageTitle: "Add Staff",
    path: "/admin/add-staff",
    editing: false,
    hasError: false,
    staff: req.staff,
    staffInfo: null,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.getEditStaff = (req, res, next) => {
  const editMode = req.query.edit;
  const staffId = req.params.staffId;
  if (!editMode) {
    return res.redirect("/admin/listStaffs");
  }
  Staff.findById(staffId)
    .then((staffInfo) => {
      if (!staffInfo) {
        const updateLink = "/admin/listStaffs";
        RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
          rDLink.updateLink(updateLink);
        });
        return res.redirect("/admin/listStaffs");
      } else {
        const updateLink = `/admin/edit-staff/${staffId}?edit=true`;
        RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
          rDLink.updateLink(updateLink);
        });
        return res.render("admin/edit-staff", {
          pageTitle: "edit Staff",
          path: "/admin/edit-staff",
          editing: editMode,
          hasError: false,
          staffInfo: staffInfo,
          staff: req.staff,
          errorMessage: null,
          validationErrors: [],
          isAuthenticated: req.session.isLoggedIn,
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.getCovidStaffs = (req, res, next) => {
  Staff.find({ role: "staff", department: req.staff.department })
    // Product.findAll()
    .then((staffs) => {
      const updateLink = "/admin/covidStaffs";
      RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
        rDLink.updateLink(updateLink);
      });
      res.render("admin/covidStaffs", {
        staffs: staffs,
        staff: req.staff,
        pageTitle: "CovidStaffs",
        path: "/staff/form-covidInfo",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.postAddStaff = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const role = req.body.role;
  const doB = req.body.doB;
  const startDate = req.body.startDate;
  const department = req.body.department;
  const salaryScale = req.body.salaryScale;
  const annualLeave = req.body.annualLeave;
  const image = req.file;
  console.log(image);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const updateLink = "/admin/add-staff";
    RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
      rDLink.updateLink(updateLink);
    });
    return res.status(422).render("admin/edit-staff", {
      path: "/add-staff",
      pageTitle: "/admin/add-staff",
      errorMessage: errors.array()[0].msg,
      editing: false,
      hasError: true,
      staff: req.staff,
      staffInfo: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
        name: name,
        role: role,
        doB: doB,
        startDate: startDate,
        department: department,
        salaryScale: salaryScale,
        annualLeave: { leffDayOff: annualLeave },
      },
      validationErrors: errors.array(),
    });
  }
  if (!image) {
    const updateLink = "/admin/add-staff";
    RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
      rDLink.updateLink(updateLink);
    });
    return res.status(422).render("admin/edit-staff", {
      path: "/add-staff",
      pageTitle: "/admin/add-staff",
      errorMessage: "Attached file is not an image",
      hasError: true,
      editing: false,
      staff: req.staff,
      staffInfo: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
        name: name,
        role: role,
        doB: doB,
        startDate: startDate,
        department: department,
        salaryScale: salaryScale,
        annualLeave: annualLeave,
      },
      validationErrors: [],
    });
  }

  const imageUrl = image.path;
  brcypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const staff = new Staff({
        email: email,
        password: hashedPassword,
        name: name,
        role: role,
        doB: doB,
        startDate: startDate,
        department: department,
        salaryScale: salaryScale,
        annualLeave: { leffDayOff: annualLeave, dayOffs: [] },
        imageUrl: imageUrl,
      });
      return staff.save();
    })
    .then((result) => {
      // console.log(result);
      console.log("created staff");
      const updateLink = "/admin/listStaffs";
      RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
        rDLink.updateLink(updateLink);
      });
      res.redirect("/admin/listStaffs");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.postEditStaff = (req, res, next) => {
  const staffId = req.body.staffId;
  const updatedName = req.body.name;
  const updatedRole = req.body.role;
  const updatedDoB = req.body.doB;
  const image = req.file;
  const updatedStartDate = req.body.startDate;
  const updatedDepartment = req.body.department;
  const updatedAnnualLeave = req.body.annualLeave;
  const updatedSalaryScale = req.body.salaryScale;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-staff", {
      pageTitle: "Edit Staff",
      path: "/admin/edit-staff",
      editing: true,
      hasError: true,
      staff: req.staff,
      staffInfo: {
        name: updatedName,
        role: updatedRole,
        doB: updatedDoB,
        startDate: updatedStartDate,
        department: updatedDepartment,
        annualLeave: { leffDayOff: updatedAnnualLeave },
        salaryScale: updatedSalaryScale,
        _id: staffId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Staff.findById(staffId)
    .then((staff) => {
      staff.name = updatedName;
      staff.role = updatedRole;
      staff.doB = updatedDoB;
      staff.startDate = updatedStartDate;
      staff.department = updatedDepartment;
      staff.annualLeave.leffDayOff = updatedAnnualLeave;
      staff.salaryScale = updatedSalaryScale;
      if (image) {
        fileHelper.deleteFile(staff.imageUrl);
        staff.imageUrl = image.path;
      }
      return staff.save().then((result) => {
        console.log("UPDATE STAFF.");
        res.redirect(`/admin/staff/infomation/${staffId}`);
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getStaffInfoCovid = (req, res, next) => {
  const staffId = req.params.staffId;
  let newArr;
  Staff.findById(staffId)
    .then((staff) => {
      if (!staff) {
        return next(new Error("No staff found."));
      }

      CovidInfo.find({ staffId: staff._id })
        .then((covidInfos) => {
          if (covidInfos && covidInfos.length < 14) {
            newArr = covidInfos;
          } else {
            newArr = covidInfos.slice(covidInfos.length - 15);
          }
          return newArr;
        })
        .then((covidInfos) => {
          const updateLink = `/admin/staff/${staffId}`;
          RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
            rDLink.updateLink(updateLink);
          });
          res.render("admin/staffInfoCovid", {
            staff: req.staff,
            staffName: staff.name,
            staff_Id: staff._id,
            staffDepartment: staff.department,
            covidInfos: covidInfos,
            covidInfo: covidInfos[covidInfos.length - 1],
            pageTitle: "staffInfoCovid",
            path: "/staff/form-covidInfo",
          });
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getPdfStaffInfoCovid = (req, res, next) => {
  const staffId = req.params.staffId;

  let newArr;
  Staff.findById(staffId)
    .then((staff) => {
      if (!staff) {
        return next(new Error("No staff found."));
      }
      CovidInfo.find({ staffId: staffId })
        .then((covidInfos) => {
          if (!covidInfos) {
            return next(new Error("No order found."));
          }
          if (covidInfos && covidInfos.length < 14) {
            newArr = covidInfos;
          } else {
            newArr = covidInfos.slice(covidInfos.length - 15);
          }
          return newArr;
        })
        .then((covidInfos) => {
          const covidName = "staffCovidInfomation.pdf";
          const covidInfoPath = path.join("data", "covidInfos", covidName);
          const pdfDoc = new PDFDocument();
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            'inline; filename="' + covidName + '"'
          );
          pdfDoc.pipe(fs.createWriteStream(covidInfoPath));
          pdfDoc.pipe(res);
          pdfDoc.fontSize(26).text("Thông tin covid cá nhân", {
            underline: false,
          });
          pdfDoc.text("-*-*-*-*-*-*-*-*-*-*-*-*-*-*-");
          pdfDoc.fontSize(16).text("Tên nhân viên: " + staff.name);
          pdfDoc
            .fontSize(16)
            .text("Mã Id: " + staff._id.toString().slice(0, 6));
          pdfDoc.fontSize(16).text("Bô phân: " + staff.department);
          pdfDoc.text("-------------------------*--------------------");
          pdfDoc.fontSize(22).text("Thông tin covid da dang ký");
          if (covidInfos[covidInfos.length - 1].vaccinnated[0]) {
            pdfDoc.fontSize(16).text("Vaccine mui 1: da tiêm");
            pdfDoc
              .fontSize(16)
              .text(
                "loai vaccin: " +
                  covidInfos[covidInfos.length - 1].vaccinnated[0].vaccineType
              );
            pdfDoc.fontSize(16).text(
              "Ngay tiem: " +
                covidInfos[covidInfos.length - 1].vaccinnated[0].vaccinnatedDate
                  .getDate()
                  .toString()
                  .concat(
                    "/" +
                      (covidInfos[
                        covidInfos.length - 1
                      ].vaccinnated[0].vaccinnatedDate.getMonth() +
                        1) +
                      "/" +
                      covidInfos[
                        covidInfos.length - 1
                      ].vaccinnated[0].vaccinnatedDate.getFullYear()
                  )
            );
          }
          if (!covidInfos[covidInfos.length - 1].vaccinnated[0]) {
            pdfDoc.fontSize(16).text("Vaccine mui 1: chua tiem");
          }
          if (covidInfos[covidInfos.length - 1].vaccinnated[1]) {
            pdfDoc.fontSize(16).text("Vaccine mui 2: da tiêm");
            pdfDoc
              .fontSize(16)
              .text(
                "loai vaccin: " +
                  covidInfos[covidInfos.length - 1].vaccinnated[1].vaccineType
              );
            pdfDoc.fontSize(16).text(
              "Ngay tiem: " +
                covidInfos[covidInfos.length - 1].vaccinnated[1].vaccinnatedDate
                  .getDate()
                  .toString()
                  .concat(
                    "/" +
                      (covidInfos[
                        covidInfos.length - 1
                      ].vaccinnated[1].vaccinnatedDate.getMonth() +
                        1) +
                      "/" +
                      covidInfos[
                        covidInfos.length - 1
                      ].vaccinnated[1].vaccinnatedDate.getFullYear()
                  )
            );
          }
          if (!covidInfos[covidInfos.length - 1].vaccinnated[1]) {
            pdfDoc.fontSize(16).text("Vaccine mui 2: chua tiem");
          }
          pdfDoc.text("-------------------------*--------------------");
          pdfDoc
            .fontSize(22)
            .text("Thông tin than nhiet do trong 14 ngay gan day");
          covidInfos.forEach((c) => {
            pdfDoc.fontSize(16).text(
              "ngay gio do:" +
                c.declareedDate
                  .getDate()
                  .toString()
                  .concat(
                    "/" +
                      (c.declareedDate.getMonth() + 1) +
                      "/" +
                      c.declareedDate.getFullYear()
                  ) +
                " " +
                c.declareedDate
                  .getHours()
                  .toString()
                  .concat("h")
                  .concat(
                    c.declareedDate.getMinutes() >= 10
                      ? c.declareedDate.getMinutes().toString()
                      : "0" + c.declareedDate.getMinutes()
                  )
            );
            pdfDoc.fontSize(16).text("than nhiet: " + c.temperature);
            pdfDoc
              .fontSize(16)
              .text(
                "-------------------------------------------------------------------"
              );
          });
          pdfDoc.end();
        });
    })

    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getAdminManager = (req, res, next) => {
  const updateLink = "/admin/adminManager";
  RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
    rDLink.updateLink(updateLink);
  });
  res.render("admin/adminManager", {
    staff: req.staff,
    pageTitle: "CovidStaffs",
    path: "/admin/adminManager",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.getListStaffs = (req, res, next) => {
  Staff.find({ role: "staff", department: req.staff.department })
    .then((staffs) => {
      const updateLink = "/admin/listStaffs";
      RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
        rDLink.updateLink(updateLink);
      });
      return res.render("admin/listStaffs", {
        staffs: staffs,
        staff: req.staff,
        pageTitle: "List-Staffs",
        path: "/admin/adminManager",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getStaffInfo = (req, res, next) => {
  const staffId = req.params.staffId;
  Staff.findById(staffId)
    .then((staffInfo) => {
      const updateLink = `/admin/staff/infomation/${staffId}`;
      RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
        rDLink.updateLink(updateLink);
      });
      return res.render("staff/getStaffInfo", {
        staffInfo: staffInfo,
        staff: req.staff,
        pageTitle: "List-Staffs",
        path: "/admin/adminManager",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getStaffSession = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  const staffId = req.params.staffId;

  Staff.findById(staffId)
    .then((staffInfo) => {
      if (!staffInfo) {
        return next(new Error("No staff found."));
      }
      Session.find({ staffId: staffInfo._id })
        .countDocuments()
        .then((numSessions) => {
          totalItems = numSessions;
          // console.log(numSessions);
          return Session.find({ staffId: staffInfo._id })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
        })
        .then((sessions) => {
          const dayOffs = staffInfo.annualLeave.dayOffs;
          const dayOffsSort = dayOffs.sort((a, b) =>
            a.dateOff > b.dateOff ? 1 : a.dateOff < b.dateOff ? -1 : 1
          );
          const sessionsSort = sessions.sort((a, b) =>
            a.checkIn > b.checkIn ? 1 : a.checkIn < b.checkIn ? -1 : 1
          );
          const updateLink = `/admin/staff/session/${staffId}`;
          RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
            rDLink.updateLink(updateLink);
          });
          return res.render("admin/staff-session", {
            staffInfo: staffInfo,
            adminName: null,
            sessions: sessionsSort,
            dayOffs: dayOffsSort,
            salaryProper: null,
            staff: req.staff,
            pageTitle: "staff-Sessions",
            path: "/admin/adminManager",
            errMsg: null,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.postDeleteSession = (req, res, next) => {
  const sessionId = req.body.sessionId;
  Session.findById(sessionId)
    .then((session) => {
      if (!session) {
        return next(new Error("no Session found."));
      }
      Session.findByIdAndDelete(session._id).then((result) => {
        console.log("destroyed Session");
        const staffId = session.staffId;
        const updateLink = `/admin/staff/session/${staffId}`;
        RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
          rDLink.updateLink(updateLink);
        });
        return res.redirect(`/admin/staff/session/${staffId}`);
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.postConfirmSession = (req, res, next) => {
  const sessionId = req.body.sessionId;
  Session.findById(sessionId)
    .then((session) => {
      session.confirm = true;
      return session.save().then((result) => {
        const staffId = session.staffId;
        const updateLink = `/admin/staff/session/${staffId}`;
        RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
          rDLink.updateLink(updateLink);
        });
        return res.redirect(`/admin/staff/session/${staffId}`);
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.postDetailMonth = (req, res, next) => {
  const staffId = req.body.staffId;
  const monthString = req.body.month;
  const [inputMonth, inputYear] = monthString
    .split("/")
    .map((i) => parseInt(i));
  const startOfMonth = new Date(inputYear, inputMonth - 1, 1);
  const endOfMonth = new Date(inputYear, inputMonth, 0);
  Staff.findById(staffId)
    .then((staffInfo) => {
      if (!staffInfo) {
        return next(new Error("no staff found."));
      }
      return Session.find({
        staffId: staffInfo._id,
        checkIn: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      })
        .then((sessions) => {
          const dayOffs = staffInfo.annualLeave.dayOffs;
          const dayOffsSort = dayOffs.sort((a, b) =>
            a.dateOff > b.dateOff ? 1 : a.dateOff < b.dateOff ? -1 : 1
          );

          // console.log(sessions);
          // loop through all date months

          // for now assume each month has 31 days
          // TODO: get the max number of days depending on specific month
          const ENDOFMONTH = 31;
          const totalOvertimeArr = [];
          const totalWorktime = [];

          for (let j = 1; j <= ENDOFMONTH; j++) {
            const sessionDate = sessions.filter(
              (session) => session.checkIn.getDate() === j
            );
            let sum = 0;
            let hourOff = 0;
            const sessiontdMap = sessionDate.map((s) => {
              const workTime = (s.checkOut - s.checkIn) / 3600000;
              sum += workTime;
            });

            // console.log(sum);
            const dayOffFilter = dayOffs.filter((d) => {
              let arr = d.dateOff.split(",");
              for (let i = 0; i < arr.length - 1; i++) {
                return parseInt(arr[i].slice(3, 5)) === j;
              }
              console.log(arr);
            });
            console.log(dayOffFilter);
            const dateOffMap = dayOffFilter.map((d) => {
              hourOff += d.quantityDays;
            });
            let tongTimes = sum + hourOff;
            // console.log(tongTimes);
            totalWorktime.push(tongTimes);
            let overtime;
            if (sessionDate.length > 0) {
              overtime = tongTimes - 8;
            } else {
              overtime = 0;
            }
            // console.log(overtime);
            totalOvertimeArr.push(overtime);
          }
          // console.log(totalWorktime);
          // mang cac ngay da lam
          const workedArr = totalOvertimeArr.filter((t) => t != 0);

          let overtimeMonth = 0;
          let subHours = 0;
          const workedArrMap = workedArr.map((t) => {
            if (t >= 0) {
              overtimeMonth += t;
            } else {
              subHours -= t;
            }
          });
          overtimeMonth = overtimeMonth.toFixed(1);
          subHours = subHours.toFixed(1);

          // let totalOvertime = 0;
          // for (let i = 0; i < totalOvertimeArr.length - 1; i++) {
          //   totalOvertime += totalOvertimeArr[i];
          // }
          // // console.log(totalOvertime.toFixed(2));
          const salaryMonth =
            req.staff.salaryScale * 3000000 +
            (overtimeMonth - subHours) * 200000;
          const ctt =
            "Lương = salaryScale * 3000000 + (overTime - số giờ làm thiếu) * 200000. Số giờ làm còn thiếu là khi chưa đủ 8h/ngày kể cả đã cộng annualLeave của ngày đó.";
          const salaryProper = {
            salary: salaryMonth,
            overtime: overtimeMonth,
            subtraction: subHours,
            formula: ctt,
            salaryScale: req.staff.salaryScale,
            monthString: monthString,
          };
          const updateLink = `/admin/staff/session/${staffId}`;
          RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
            rDLink.updateLink(updateLink);
          });
          res.render("admin/staff-session", {
            staffInfo: staffInfo,
            sessions: sessions,
            dayOffs: dayOffsSort,
            staff: req.staff,
            salaryProper: salaryProper,
            pageTitle: "staff-Sessions",
            path: "/staff/infoSessions",
            errMsg: null,
            adminName: null,
            currentPage: null,
            hasNextPage: null,
            hasPreviousPage: null,
            nextPage: null,
            previousPage: null,
            lastPage: null,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.postDeleteStaff = (req, res, next) => {
  const staffId = req.body.staffId;
  console.log(staffId);
  Staff.findByIdAndDelete(staffId)
    .then((result) => {
      console.log("DESTROYED STAFF.");
      const updateLink = "/admin/listStaffs";
      RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
        rDLink.updateLink(updateLink);
      });
      return res.redirect("/admin/listStaffs");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};
