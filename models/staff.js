const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const staffSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  doB: {
    type: Date,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  salaryScale: {
    type: Number,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  annualLeave: {
    leffDayOff: { type: Number, required: true },
    dayOffs: [
      {
        dateOff: { type: String, required: true },
        reason: { type: String, required: true },
        quantityDays: { type: Number, required: true },
      },
    ],
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Staff", staffSchema);
