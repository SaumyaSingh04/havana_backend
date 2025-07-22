import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // 🔹 Core Booking Info
  grcNo: { type: String, unique: true, required: true },  // Guest Registration Card No
  reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', default: null },

  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  roomNumber: { type: Number },
  numberOfRooms: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
  status: {
    type: String,
    enum: ['Booked', 'Checked In', 'Checked Out', 'Cancelled'],
    default: 'Booked'
  },
  referenceNumber: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },

  // 🔹 Guest Info
  guestDetails: {
    salutation: String,
    name: { type: String },
    age: Number,
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    photoUrl: String
  },

  // 🔹 Contact Info
  contactDetails: {
    phone: String,
    email: String,
    address: String,
    city: String,
    state: String,
    country: String,
    pinCode: String
  },

  // 🔹 Identity Info
  identityDetails: {
    idType: {
      type: String,
      enum: ['Aadhaar', 'PAN', 'Passport', 'Driving License', 'Voter ID', 'Other']
    },
    idNumber: String,
    idPhotoFront: String,
    idPhotoBack: String
  },

  // 🔹 Booking Info
  bookingInfo: {
    checkIn: { type: Date },
    checkOut: { type: Date },
    arrivalFrom: String,
    bookingType: {
      type: String,
      enum: ['Online', 'Walk-in', 'Agent', 'Corporate', 'Other']
    },
    purposeOfVisit: String,
    remarks: String,
    adults: Number,
    children: Number
  },

  // 🔹 Extension History
  extensionHistory: [
    {
      originalCheckIn: { type: Date },
      originalCheckOut: { type: Date },
      extendedCheckOut: { type: Date },
      extendedOn: { type: Date, default: Date.now },
      reason: String,
      additionalAmount: Number,
      paymentMode: {
        type: String,
        enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other']
      },
      approvedBy: String
    }
  ],

  // 🔹 Payment Info
  paymentDetails: {
    totalAmount: Number,
    advancePaid: Number,
    paymentMode: {
      type: String,
      enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other']
    },
    billingName: String,
    billingAddress: String,
    gstNumber: String
  },

  // 🔹 Vehicle Info
  vehicleDetails: {
    vehicleNumber: String,
    vehicleType: String,
    vehicleModel: String,
    driverName: String,
    driverMobile: String
  },

  // 🔹 Flags
  vip: { type: Boolean, default: false },
  isForeignGuest: { type: Boolean, default: false }
}, { timestamps: true });

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
