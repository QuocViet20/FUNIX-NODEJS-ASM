const CovidInfo = require("../models/covidInfo");
const Session = require("../models/session");
const Staff = require("../models/staff");
const RedirectLink = require("../models/redirectLink");

const { validationResult } = require("express-validator/check");

const fileHelper = require("../util/file");

const ITEMS_PER_PAGE = 3;

exports.getStaff = (req, res, next) => {
  Session.find({
    staffId: req.staff._id,
  })

    .then((sessions) => {
      const updateLink = "/staff";
      RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
        rDLink.updateLink(updateLink);
      });
      return res.render("staff/getStaff", {
        endSession: sessions[sessions.length - 1],
        staff: req.staff,
        pageTitle: "staff",
        path: "/staff",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};
exports.getStaffStart = (req, res, next) => {
  const updateLink = "/staff/start";
  RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
    rDLink.updateLink(updateLink);
  });
  return res.render("staff/getStaffStart", {
    staff: req.staff,
    pageTitle: "staff-start",
    path: "/staff",
  });
};

//post add-session

exports.postAddSession = (req, res, next) => {
  const workPlace = req.body.workPlace;

  const session = new Session({
    workPlace: workPlace,
    workingStatus: true,
    confirm: false,
    checkIn: new Date(),
    staffId: req.staff._id,
  });
  Session.find({ staffId: req.staff._id })
    .then((sessions) => {
      const CheckOutFilter = sessions.filter((s) => !s.checkOut);
      if (CheckOutFilter.length > 0) {
        const errMsg =
          "Bạn vẫn đang trong trạng thái đang làm việc không thể bắt đầu phiên làm việc mới.";
        const updateLink = "/staff/startCheckIn";
        RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
          rDLink.updateLink(updateLink);
        });
        return res.render("staff/sessionCheckIn", {
          errMsg: errMsg,
          staff: req.staff,
          pageTitle: "errorCheckIn",
          path: "/staff",
        });
      } else {
        session
          .save()
          .then((result) => {
            return res.redirect("/staff/startCheckIn");
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getStaffCheckIn = (req, res, next) => {
  Session.find({ staffId: req.staff._id })
    .then((sessions) => {
      const updateLink = "/staff/startCheckIn";
      RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
        rDLink.updateLink(updateLink);
      });
      res.render("staff/sessionCheckIn", {
        session: sessions[sessions.length - 1],
        getTime: sessions[sessions.length - 1].checkIn
          .getHours()
          .toString()
          .concat(
            " : " +
              sessions[sessions.length - 1].checkIn.getMinutes().toString()
          ),
        staffName: req.staff.name,
        pageTitle: "staff-CheckIn",
        staff: req.staff,
        path: "/staff",
        errMsg: null,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.updateSession = (req, res, next) => {
  const sessionId = req.body.sessionId;
  const d = new Date();
  Session.find({ staffId: req.staff._id })
    .then((sessions) => {
      const sessionsFilterCheckOut = sessions.filter((s) => !s.checkOut);
      if (sessionsFilterCheckOut.length > 0) {
        Session.findById(sessionId)
          .then((session) => {
            session.checkOut = d;
            session.workingStatus = false;
            session.confirm = false;
            return session.save();
          })
          .then((result) => {
            const updateLink = "/staff/sessions";
            RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
              rDLink.updateLink(updateLink);
            });
            res.redirect("/staff/sessions");
          })
          .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(err);
          });
      } else {
        const errMsg = "Bạn đã checkOut rồi";
        console.log(errMsg);
        return res.render("staff/getSessions", {
          errMsg: errMsg,
          pageTitle: "errorCheckOut",
          path: "",
        });
      }
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getSessions = (req, res, next) => {
  const d = new Date().getDate();
  Session.find({ staffId: req.staff._id })
    .then((sessions) => {
      const sessionsToday = sessions.filter((s) => {
        return s.checkOut.getDate() === d;
      });

      return sessionsToday;
    })
    .then((sessionsTd) => {
      let sum = 0;
      const sessiontdMap = sessionsTd.map((s) => {
        const workTime = s.checkOut - s.checkIn;
        sum += workTime;
      });
      const tongTimes = (sum / 3600000).toFixed(1);
      const updateLink = "/staff/sessions";
      RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
        rDLink.updateLink(updateLink);
      });
      res.render("staff/getSessions", {
        sessions: sessionsTd,
        tongWorkTimes: tongTimes,
        staff: req.staff,
        staffName: req.staff.name,
        pageTitle: "staff-Sessions",
        path: "",
        errMsg: null,
      });
    })

    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getFormDayoff = (req, res, next) => {
  const updateLink = "/staff/formDayoff";
  RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
    rDLink.updateLink(updateLink);
  });
  res.render("staff/formDayoff", {
    staff: req.staff,
    pageTitle: "formDayoff",
    path: "/staff",
    errMsg: "",
    validationErrors: [],
    oldInput: {
      dateOff: "",
      quantityDays: "",
      reason: "",
    },
  });
};

exports.postAddAnnualLeav = (req, res, next) => {
  const dateOff = req.body.dayOff;
  let dateOffArr = dateOff.split(",");
  const quantityDays = req.body.quantityDayoffs;
  const reason = req.body.reason;
  const staffAnnualLeave = req.staff.annualLeave;
  const errors = validationResult(req);
  console.log(errors.array());
  if (!errors.isEmpty()) {
    const updateLink = "/staff/formDayoff";
    RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
      rDLink.updateLink(updateLink);
    });
    return res.status(422).render("staff/formDayoff", {
      staff: req.staff,
      pageTitle: "errDayoff",
      path: "/staff",
      errMsg: errors.array()[0].msg,
      oldInput: {
        dateOff: dateOff,
        quantityDays: quantityDays,
        reason: reason,
      },
      validationErrors: errors.array(),
    });
  }
  if (staffAnnualLeave.leffDayOff === 0) {
    const errMsg = "Bạn đã dùng hết số ngày nghỉ phép";
    const updateLink = "/staff/formDayoff";
    RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
      rDLink.updateLink(updateLink);
    });
    return res.render("staff/formDayoff", {
      staff: req.staff,
      pageTitle: "errDayoff",
      path: "/staff",
      errMsg: errMsg,
      oldInput: {
        dateOff: dateOff,
        quantityDays: quantityDays,
        reason: reason,
      },
      validationErrors: [],
    });
  }
  if (quantityDays / 8 > staffAnnualLeave.leffDayOff) {
    const errMsg = "Số giờ bạn chọn quá tối đa bạn có thể chọn";
    const updateLink = "/staff/formDayoff";
    RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
      rDLink.updateLink(updateLink);
    });
    return res.render("staff/formDayoff", {
      staff: req.staff,
      pageTitle: "errDayoff",
      path: "/staff",
      errMsg: errMsg,
      oldInput: {
        dateOff: dateOff,
        quantityDays: quantityDays,
        reason: reason,
      },
      validationErrors: [],
    });
  }
  if (quantityDays > 8) {
    const errMsg =
      "Một ngày bạn chỉ chọn tối đa 8h, vui lòng trở lại và chọn lại!!!";
    const updateLink = "/staff/formDayoff";
    RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
      rDLink.updateLink(updateLink);
    });
    return res.render("staff/formDayoff", {
      staff: req.staff,
      pageTitle: "errDayoff",
      path: "/staff",
      errMsg: errMsg,
      oldInput: {
        dateOff: dateOff,
        quantityDays: quantityDays,
        reason: reason,
      },
      validationErrors: [],
    });
  } else {
    staffAnnualLeave.leffDayOff =
      staffAnnualLeave.leffDayOff - (quantityDays * dateOffArr.length) / 8;
    const dayOff = {
      dateOff: dateOff,
      quantityDays: quantityDays,
      reason: reason,
    };
    const newDayOffs = [...staffAnnualLeave.dayOffs];
    newDayOffs.push(dayOff);
    staffAnnualLeave.dayOffs = newDayOffs;
    return req.staff
      .save()
      .then((result) => {
        console.log(result);
        const updateLink = "/staff/dayoff";
        RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
          rDLink.updateLink(updateLink);
        });
        res.redirect("/staff/dayoff");
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(err);
      });
  }
};

exports.getDayoff = (req, res, next) => {
  const annualLeave = req.staff.annualLeave;
  // const dateTmp = annualLeave.dayOffs[annualLeave.dayOffs.length - 1].dateOff;
  // const dateOff = dateTmp
  //   .getDate()
  //   .toString()
  //   .concat(
  //     "/" + (dateTmp.getMonth() + 1).toString() + "/" + dateTmp.getFullYear()
  //   );
  // console.log(dateOff);
  const updateLink = "/staff/dayoff";
  RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
    rDLink.updateLink(updateLink);
  });
  res.render("staff/getDayoff", {
    staff: req.staff,
    annualLeave: annualLeave,
    dateOff: annualLeave.dayOffs[annualLeave.dayOffs.length - 1].dateOff,
    errMsg: null,
    pageTitle: "Dayoff",
    path: "/staff",
  });
};

exports.getStaffInfo = (req, res, next) => {
  const updateLink = "/staff/information";
  RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
    rDLink.updateLink(updateLink);
  });
  res.render("staff/getStaffInfo", {
    staffInfo: null,
    staff: req.staff,
    errMsg: null,
    pageTitle: "Information",
    path: "/staff/information",
  });
};

exports.staffUpdateImage = (req, res, next) => {
  const image = req.file;
  console.log(req.staff.imageUrl);
  // fileHelper.deleteFile(req.staff.imageUrl);

  req.staff.imageUrl = image.path;
  return req.staff
    .save()
    .then((result) => {
      const updateLink = "/staff/information";
      RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
        rDLink.updateLink(updateLink);
      });
      res.redirect("/staff/information");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getInfoSessions = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  let adminName = "";

  Staff.find({
    role: "manager",
    department: req.staff.department,
  })
    .then((admin) => {
      return (adminName = admin[0].name);
    })
    .then((result) => {
      Session.find({ staffId: req.staff._id })
        .countDocuments()
        .then((numSessions) => {
          totalItems = numSessions;
          // console.log(numSessions);
          return Session.find({ staffId: req.staff._id })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);
        })
        .then((sessions) => {
          const dayOffs = req.staff.annualLeave.dayOffs;
          const dayOffsSort = dayOffs.sort((a, b) =>
            a.dateOff > b.dateOff ? 1 : a.dateOff < b.dateOff ? -1 : 1
          );
          const sessionsSort = sessions.sort((a, b) =>
            a.checkIn > b.checkIn ? 1 : a.checkIn < b.checkIn ? -1 : 1
          );
          const updateLink = "/staff/infoSessions";
          RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
            rDLink.updateLink(updateLink);
          });
          res.render("staff/getInfoSessions", {
            adminName: adminName,
            sessions: sessionsSort,
            dayOffs: dayOffsSort,
            salaryProper: null,
            staff: req.staff,
            pageTitle: "staff-Sessions",
            path: "/staff/infoSessions",
            errMsg: null,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
          });
        });
    })

    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.postSalaryMonth = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  const adminName = "";
  if (req.staff.role === "staff") {
    Staff.find({
      role: "manager",
      department: req.staff.department,
    }).then((admin) => {
      return (adminName = admin[0].name);
    });
  }
  const monthString = req.body.month;
  const [inputMonth, inputYear] = monthString
    .split("/")
    .map((i) => parseInt(i));
  const startOfMonth = new Date(inputYear, inputMonth - 1, 1);
  const endOfMonth = new Date(inputYear, inputMonth, 0);
  Session.find({
    staffId: req.staff._id,
    checkIn: {
      $gte: startOfMonth,
      $lte: endOfMonth,
    },
  })
    .countDocuments()
    .then((numSessions) => {
      totalItems = numSessions;
      // console.log(numSessions);
      return Session.find({ staffId: req.staff._id })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((sessions) => {
      const dayOffs = req.staff.annualLeave.dayOffs;
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
        req.staff.salaryScale * 3000000 + (overtimeMonth - subHours) * 200000;
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
      const updateLink = "/staff/infoSessions";
      RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
        rDLink.updateLink(updateLink);
      });
      res.render("staff/getInfoSessions", {
        sessions: sessions,
        dayOffs: dayOffsSort,
        staff: req.staff,
        salaryProper: salaryProper,
        pageTitle: "staff-Sessions",
        path: "/staff/infoSessions",
        errMsg: null,
        adminName: adminName,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

// form covid info
exports.getFormCovidInfo = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  CovidInfo.find({ staffId: req.staff._id })
    .then((covidInfos) => {
      if (covidInfos.length > 0) {
        const vaccine1 = covidInfos[covidInfos.length - 1].vaccinnated[0];
        const vaccine2 = covidInfos[covidInfos.length - 1].vaccinnated[1];

        const updateLink = "/staff/form-covidInfo";
        RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
          rDLink.updateLink(updateLink);
        });
        return res.render("staff/formCovidInfo", {
          covidInfo: covidInfos[covidInfos.length - 1],
          vaccine1: vaccine1,
          vaccine2: vaccine2,
          staff: req.staff,
          pageTitle: "Covid-Detail",
          path: "/staff/form-covidInfo",
          errMsg: message,
        });
      } else {
        const updateLink = "/staff/form-covidInfo";
        RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
          rDLink.updateLink(updateLink);
        });
        return res.render("staff/formCovidInfo", {
          covidInfo: null,
          staff: req.staff,
          pageTitle: "Covid-Detail",
          path: "/staff/form-covidInfo",
          errMsg: message,
        });
      }
    })
    .catch((err) => console.log(err));
};

//post covid info
exports.postAddCovidInfo = (req, res, next) => {
  const temperature = req.body.temperature;
  const vaccinnated1 = req.body.vaccinnated1;
  const vaccineType1 = req.body.vaccineType1;
  const vaccinnatedDate1 = req.body.vaccinnatedDate1;
  const vaccinnated2 = req.body.vaccinnated2;
  const vaccineType2 = req.body.vaccineType2;
  const vaccinnatedDate2 = req.body.vaccinnatedDate2;
  const covidStatus = req.body.covidStatus;

  if (!temperature) {
    req.flash("error", "Vui lòng điền thân nhiệt của bạn.");
    return res.redirect("/staff/form-covidInfo");
  }
  let vaccine = [];
  if (vaccinnated1 === "yes") {
    vaccine.push({
      number: 1,
      vaccineType: vaccineType1,
      vaccinnatedDate: vaccinnatedDate1,
    });
  }
  if (vaccinnated1 === "no") {
    vaccine = [];
  }
  if (vaccinnated2 === "yes" && vaccinnated1 === "yes") {
    vaccine.push({
      number: 2,
      vaccineType: vaccineType2,
      vaccinnatedDate: vaccinnatedDate2,
    });
  }
  if (vaccinnated2 === "no") {
    vaccine = [...vaccine];
  }
  // console.log(vaccine);
  // console.log(vaccinnated2, vaccinnated1);
  const covidInfo = new CovidInfo({
    declareedDate: new Date(),
    temperature: temperature,
    vaccinnated: vaccine,
    covidStatus: covidStatus,
    staffId: req.staff._id,
  });
  covidInfo
    .save()
    .then((result) => {
      const updateLink = "/staff/covidInfo";
      RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
        rDLink.updateLink(updateLink);
      });
      res.redirect("/staff/covidInfo");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getCovidInfo = (req, res, next) => {
  CovidInfo.find()
    .then((covidInfos) => {
      const updateLink = "/staff/covidInfo";
      RedirectLink.findOne({ staffId: req.staff._id }).then((rDLink) => {
        rDLink.updateLink(updateLink);
      });
      res.render("staff/getCovidInfo", {
        covidInfo: covidInfos[covidInfos.length - 1],
        vaccine1: covidInfos[covidInfos.length - 1].vaccine,
        staff: req.staff,
        pageTitle: "staff-covidInfo",
        path: "/staff/form-covidInfo",
        errMsg: null,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};
