const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  workPlace: {
    type: String,
    required: true,
  },
  workingStatus: {
    type: Boolean,
    required: true,
  },
  confirm: {
    type: Boolean,
    required: true,
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: false,
  },
  staffId: {
    type: Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
});

module.exports = mongoose.model("Session", sessionSchema);
