const Staff = require("../models/staff");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator/check");

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,

    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  console.log(errors);
  console.log(errors.array());
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "login",
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email, password: password },
      validationErrors: errors.array(),
    });
  }
  Staff.findOne({ email: email })
    .then((staff) => {
      if (!staff) {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "login",
          errorMessage: "invalid email or password",
          oldInput: { email: email, password: password },
          validationErrors: errors.array(),
        });
      }
      bcrypt
        .compare(password, staff.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.staff = staff;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/staff");
            });
          }
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "login",
            errorMessage: "invalid email or password",
            oldInput: { email: email, password: password },
            validationErrors: errors.array(),
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
