import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    // Auto-generated identifiers
    reservationId: {
      type: String,
      unique: true,
      required: true, // Example: RSV-20250727-1541-1234
    },
    bookingRefNo: {
      type: String,
      unique: true,
      required: true, // Same as used in Booking — ensures link
    },
    grcNo: {
      type: String,
      unique: true,
      required: true // Same used at guest check-in → Booking
    },

    // Timestamps
    r_timestamp: {
      type: Number,
      default: () => Math.floor(Date.now() / 1000),
    },
    b_timestamp: {
      type: Number,
    },

    reservationType: {
      type: String,
      enum: ["Online", "Walk-in", "Agent"],
    },
    modeOfReservation: String,

    // Room Info
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomCategory",
    },
    roomAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
    roomHoldStatus: {
      type: String,
      enum: ["Held", "Pending", "Released"],
      default: "Pending",
    },
    roomHoldUntil: Date,

    // Stay Info
    checkInDate: Date,
    checkInTime: String,
    checkOutDate: Date,
    checkOutTime: String,
    noOfRooms: { type: Number, default: 1 },
    noOfAdults: Number,
    noOfChildren: Number,
    planPackage: String,
    rate: Number,
    arrivalFrom: String,
    purposeOfVisit: String,
    roomPreferences: {
      smoking: Boolean,
      bedType: String,
    },
    specialRequests: String,
    remarks: String,
    billingInstruction: String,

    // Guest Details
    salutation: String,
    guestName: { type: String, required: true },
    nationality: String,
    city: String,
    address: String,
    phoneNo: String,
    mobileNo: String,
    email: String,
    companyName: String,
    gstApplicable: { type: Boolean, default: true },
    companyGSTIN: String,

    // Payment
    paymentMode: String,
    advancePaid: Number,
    isAdvancePaid: { type: Boolean, default: false },
    transactionId: String,
    discountPercent: Number,
    refBy: String,

    vehicleDetails: {
      vehicleNumber: String,
      vehicleType: String,
      vehicleModel: String,
      driverName: String,
      driverMobile: String,
    },

    // Reservation Lifecycle
    status: {
      type: String,
      enum: ["Confirmed", "Tentative", "Waiting", "Cancelled"],
      default: "Confirmed",
    },
    cancellationReason: String,
    cancelledBy: String,
    isNoShow: { type: Boolean, default: false },
    vip: { type: Boolean },
    isForeignGuest: { type: Boolean, default: false },
    createdBy: String,

    // Conversion — populated on check-in
    linkedCheckInId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    bookingDate: Date, // Filled during booking conversion
  },
  {
    timestamps: true,
  }
);

export const Reservation = mongoose.model("Reservation", reservationSchema);
