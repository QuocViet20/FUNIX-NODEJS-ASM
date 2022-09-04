const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const covidInfoSchema = new Schema({
  declareedDate: {
    type: Date,
    required: true,
  },
  temperature: {
    type: Number,
    required: true,
  },
  vaccinnated: [
    {
      number: { type: Number, required: true },
      vaccineType: { type: String, required: true },
      vaccinnatedDate: { type: Date, required: true },
    },
  ],
  covidStatus: {
    type: Boolean,
    required: true,
  },
  staffId: {
    type: Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
});

module.exports = mongoose.model("CovidInfo", covidInfoSchema);
