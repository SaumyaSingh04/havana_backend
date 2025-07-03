import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  // Primary Booking Info
  grcNo: { type: String },
  bookingDate: { type: Date, default: Date.now },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  days: { type: Number },
  timeIn: { type: String },
  timeOut: { type: String },

  // Guest Info
  salutation: { type: String }, //mr,mrs
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  address: { type: String },
  city: { type: String },
  nationality: { type: String },
  mobileNo: { type: String, required: true },
  email: { type: String },
  phoneNo: { type: String },
  birthDate: { type: Date },
  anniversary: { type: Date },

  // Company Info
  companyName: { type: String },
  companyGSTIN: { type: String },

  // ID & Images
  idProofType: { type: String },
  idProofNumber: { type: String },
  idProofImageUrl: { type: String },
  idProofImageUrl2: { type: String },
  photoUrl: { type: String },
  cameraPhotoUrl: { type: String },

  // Room Plan Info
  roomNo: { type: String },
  planPackage: { type: String },
  noOfAdults: { type: Number },
  noOfChildren: { type: Number },
  rate: { type: Number },
  taxIncluded: { type: Boolean },
  serviceCharge: { type: Boolean },
  isLeader: { type: Boolean },

  // Travel & Source Info
  arrivedFrom: { type: String },
  destination: { type: String },
  remark: { type: String },
  businessSource: { type: String },
  marketSegment: { type: String },
  purposeOfVisit: { type: String },

  // Financial Info
  discountPercent: { type: Number },
  discountRoomSource: { type: Number },
  paymentMode: { type: String },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed", "Partial"],
    default: "Pending"
  },
  bookingRefNo: { type: String },
  mgmtBlock: {
    type: String,
    enum: ["Yes", "No"],
    default: "No"
  },
  billingInstruction: { type: String },

  // Misc
  temperature: { type: Number },
  fromCSV: { type: Boolean, default: false },
  epabx: { type: Boolean },
  vip: { type: Boolean },
  status: {
    type: String,
    enum: ["Booked", "Checked In", "Checked Out", "Cancelled"],
    default: "Booked"
  }
}, { timestamps: true });

export const Booking = mongoose.model("Booking", bookingSchema);
