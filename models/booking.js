import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // Identifiers
    grcNo: {
      type: String,
      unique: true,
      // Example: GRC-3245
    },
    bookingRefNo: {
      type: String,
      unique: true,
      // BRF-20250727-1549-3245
    },
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      default: null,
    },

    // Timestamps
    b_timestamp: {
      type: Number,
      default: () => Math.floor(Date.now() / 1000),
    },

    // Room & Guest Info
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "RoomCategory" },
    roomNumber: Number,
    roomRate: { type: Number, required: true },
    numberOfRooms: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: "Guest" },

    status: {
      type: String,
      enum: ["Booked", "Checked In", "Checked Out", "Cancelled"],
      default: "Booked",
    },

    // createdAt/updatedAt from timestamps: true

    guestDetails: {
      salutation: String,
      name: String,
      age: Number,
      gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
      },
      photoUrl: String,
    },

    contactDetails: {
      phone: String,
      email: String,
      address: String,
      city: String,
      state: String,
      country: String,
      pinCode: String,
    },

    identityDetails: {
      idType: {
        type: String,
        enum: [
          "Aadhaar",
          "PAN",
          "Passport",
          "Driving License",
          "Voter ID",
          "Other",
        ],
      },
      idNumber: String,
      idPhotoFront: String,
      idPhotoBack: String,
    },

    bookingInfo: {
      checkIn: Date,
      checkOut: Date,
      arrivalFrom: String,
      bookingType: {
        type: String,
        enum: ["Online", "Walk-in", "Agent", "Corporate", "Other"],
      },
      purposeOfVisit: String,
      remarks: String,
      adults: Number,
      children: Number,
      actualCheckInTime: String,
      actualCheckOutTime: String,
    },

    extensionHistory: [
      {
        originalCheckIn: Date,
        originalCheckOut: Date,
        extendedCheckOut: Date,
        extendedOn: {
          type: Date,
          default: () => new Date(),
        },
        reason: String,
        additionalAmount: Number,
        paymentMode: {
          type: String,
          enum: ["Cash", "Card", "UPI", "Bank Transfer", "Other"],
        },
        approvedBy: String,
      },
    ],

    paymentDetails: {
      totalAmount: Number,
      discountPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      advancePaid: Number,
      paymentMode: {
        type: String,
        enum: ["Cash", "Card", "UPI", "Bank Transfer", "Other"],
      },
      billingName: String,
      billingAddress: String,
      gstNumber: String,
    },

    vehicleDetails: {
      vehicleNumber: String,
      vehicleType: String,
      vehicleModel: String,
      driverName: String,
      driverMobile: String,
    },

    vip: {
      type: Boolean,
      default: false,
    },
    isForeignGuest: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
