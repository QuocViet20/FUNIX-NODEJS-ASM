const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

const MONGODB_URI =
  "mongodb+srv://quocviet:quocviet@cluster0.u2lyfoa.mongodb.net/company";
const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "cookieSessions",
});

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toDateString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

const Staff = require("./models/staff");
const errorController = require("./controllers/error");
const adminRoutes = require("./routes/admin");
const staffRoutes = require("./routes/staff");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.staff) {
    return next();
  }
  Staff.findById(req.session.staff._id)
    .then((staff) => {
      if (!staff) {
        return next();
      }
      req.staff = staff;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/staff", staffRoutes);
app.use("/admin", adminRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);
app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    // User.findOne().then((user) => {
    //   if (!user) {
    //     const user = new User({
    //       name: "Quoc Viet",
    //       email: "quocvietbk@gmail.com",
    //       cart: {
    //         items: [],
    //       },
    //     });
    //     user.save();
    //   }
    // });
    console.log("connected to mongodb!");
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
