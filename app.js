const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const Staff = require("./models/staff");
const errorController = require("./controllers/error");
const adminRoutes = require("./routes/admin");
const staffRoutes = require("./routes/staff");

app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  Staff.findById("630cc82331472fc5afa2a5bd")
    .then((staff) => {
      req.staff = staff;

      next();
    })
    .catch((err) => console.log(err));
});

app.use("/staff", staffRoutes);
app.use("/admin", adminRoutes);
app.use(errorController.get404);

mongoose
  .connect("mongodb://localhost:27017/staff")
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
