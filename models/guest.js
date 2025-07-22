import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema({
  grcNo: { type: String, unique: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', unique: true },

  salutation: String,
  name: { type: String, required: true },
  age: Number,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },

  identityDetails: {
    idType: {
      type: String,
      enum: ['Aadhaar', 'PAN', 'Passport', 'Driving License', 'Voter ID', 'Other']
    },
    idNumber: String,
    idPhotoFront: String,
    idPhotoBack: String
  },

  contactDetails: {
    phone: String,
    email: String,
    address: String,
    city: String,
    state: String,
    country: String,
    pinCode: String
  },

  photoUrl: String,

  visitStats: {
    lastVisit: Date,
    totalVisits: { type: Number, default: 1 }
  }

}, { timestamps: true });

export const Guest = mongoose.models.Guest || mongoose.model('Guest', guestSchema);
