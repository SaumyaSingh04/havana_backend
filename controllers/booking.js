import { Booking } from "../models/booking.js";

// Helper to trim and clean inputs
const cleanInput = (input) => {
  if (!input || typeof input !== "string") return input;
  return input.trim();
};

// Create new booking
export const createBooking = async (req, res) => {
  try {
    const { body } = req;

    const cleanedBody = {
      ...body,
      gender: cleanInput(body.gender),
      name: cleanInput(body.name),
      salutation: cleanInput(body.salutation),
      city: cleanInput(body.city),
      nationality: cleanInput(body.nationality),
      email: cleanInput(body.email),
      phoneNo: cleanInput(body.phoneNo),
      mobileNo: cleanInput(body.mobileNo),
      companyName: cleanInput(body.companyName),
      companyGSTIN: cleanInput(body.companyGSTIN),
      businessSource: cleanInput(body.businessSource),
      marketSegment: cleanInput(body.marketSegment),
      purposeOfVisit: cleanInput(body.purposeOfVisit),
      status: cleanInput(body.status),
      paymentStatus: cleanInput(body.paymentStatus),
      mgmtBlock: cleanInput(body.mgmtBlock),
      planPackage: cleanInput(body.planPackage),
      idProofType: cleanInput(body.idProofType),
    };

    const photoUrl = req.files?.photo?.[0]?.path || "";
    const idProofImageUrl = req.files?.idProof?.[0]?.path || "";

    const newBooking = new Booking({
      ...cleanedBody,
      photoUrl,
      idProofImageUrl,
    });

    await newBooking.save();

    res.status(201).json({ success: true, booking: newBooking });
  } catch (error) {
    console.log("Create booking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update booking
export const updateBooking = async (req, res) => {
  try {
    const updatedBody = {};
    for (const key in req.body) {
      updatedBody[key] = typeof req.body[key] === "string" ? req.body[key].trim() : req.body[key];
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, updatedBody, { new: true });
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete booking (optional)
export const deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Booking deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update booking status
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: status.trim() }, { new: true });
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
