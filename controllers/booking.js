import { Booking } from "../models/booking.js";
import { Parser } from "json2csv";


// Helper to trim and clean inputs
const cleanInput = (input) => {
  if (!input || typeof input !== "string") return input;
  return input.trim();
};

export const createBooking = async (req, res) => {
  try {
    const body = req.body;

    // Generate auto GRC Number
    const count = await Booking.countDocuments();
    const newGrcNo = `GRC-${String(count + 1).padStart(3, "0")}`; // GRC-001, GRC-002...

    // Clean & prepare body
    const cleanedBody = {
      grcNo: newGrcNo,
      bookingDate: body.bookingDate || new Date(),
      checkInDate: body.checkInDate,
      checkOutDate: body.checkOutDate,
      days: body.days,
      timeIn: cleanInput(body.timeIn),
      timeOut: cleanInput(body.timeOut),

      salutation: cleanInput(body.salutation),
      name: cleanInput(body.name),
      age: body.age,
      gender: cleanInput(body.gender),
      address: cleanInput(body.address),
      city: cleanInput(body.city),
      nationality: cleanInput(body.nationality),
      mobileNo: cleanInput(body.mobileNo),
      email: cleanInput(body.email),
      phoneNo: cleanInput(body.phoneNo),
      birthDate: body.birthDate,
      anniversary: body.anniversary,

      companyName: cleanInput(body.companyName),
      companyGSTIN: cleanInput(body.companyGSTIN),

      idProofType: cleanInput(body.idProofType),
      idProofNumber: cleanInput(body.idProofNumber),

      roomNo: cleanInput(body.roomNo),
      planPackage: cleanInput(body.planPackage),
      noOfAdults: body.noOfAdults,
      noOfChildren: body.noOfChildren,
      rate: body.rate,
      taxIncluded: body.taxIncluded,
      serviceCharge: body.serviceCharge,
      isLeader: body.isLeader,

      arrivedFrom: cleanInput(body.arrivedFrom),
      destination: cleanInput(body.destination),
      remark: cleanInput(body.remark),
      businessSource: cleanInput(body.businessSource),
      marketSegment: cleanInput(body.marketSegment),
      purposeOfVisit: cleanInput(body.purposeOfVisit),

      discountPercent: body.discountPercent,
      discountRoomSource: body.discountRoomSource,
      paymentMode: cleanInput(body.paymentMode),
      paymentStatus: cleanInput(body.paymentStatus),
      bookingRefNo: cleanInput(body.bookingRefNo),
      mgmtBlock: cleanInput(body.mgmtBlock),
      billingInstruction: cleanInput(body.billingInstruction),

      temperature: body.temperature,
      fromCSV: body.fromCSV,
      epabx: body.epabx,
      vip: body.vip,
      status: cleanInput(body.status),
    };

    // Handle uploaded files
    const photoUrl = req.files?.photo?.[0]?.path;
    const idProofImageUrl = req.files?.idProof?.[0]?.path;
    const idProofImageUrl2 = req.files?.idProof2?.[0]?.path;
    const cameraPhotoUrl = req.files?.cameraPhoto?.[0]?.path;

    // Create booking
    const newBooking = new Booking({
      ...cleanedBody,
      photoUrl,
      idProofImageUrl,
      idProofImageUrl2,
      cameraPhotoUrl,
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
  
      // Trim string fields
      for (const key in req.body) {
        updatedBody[key] = typeof req.body[key] === "string" ? req.body[key].trim() : req.body[key];
      }
  
      // Handle uploaded image files if present
      if (req.files?.photoUrl?.[0]?.path) {
        updatedBody.photoUrl = req.files.photoUrl[0].path;
      }
  
      if (req.files?.idProofImageUrl?.[0]?.path) {
        updatedBody.idProofImageUrl = req.files.idProofImageUrl[0].path;
      }
  
      if (req.files?.idProofImageUrl2?.[0]?.path) {
        updatedBody.idProofImageUrl2 = req.files.idProofImageUrl2[0].path;
      }
  
      if (req.files?.cameraPhotoUrl?.[0]?.path) {
        updatedBody.cameraPhotoUrl = req.files.cameraPhotoUrl[0].path;
      }
  
      // Update booking
      const booking = await Booking.findByIdAndUpdate(req.params.id, updatedBody, { new: true });
  
      res.json({ success: true, booking });
    } catch (error) {
      console.log("Update booking error:", error);
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

// Search & Pagination
export const searchBookings = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        status,
        paymentStatus,
      } = req.query;
  
      const query = {};
  
      // Searchable fields
      if (search) {
        const regex = new RegExp(search.trim(), "i");
        query.$or = [
          { name: regex },
          { mobileNo: regex },
          { city: regex },
          { roomNo: regex },
        ];
      }
  
      // Optional filters
      if (status) query.status = status;
      if (paymentStatus) query.paymentStatus = paymentStatus;
  
      const bookings = await Booking.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
  
      const total = await Booking.countDocuments(query);
  
      res.status(200).json({
        success: true,
        bookings,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

// Export Bookings as CSV (All Fields)
export const exportBookingsCSV = async (req, res) => {
  try {
    const bookings = await Booking.find().lean();

    const fields = [
      "grcNo",
      "bookingDate",
      "checkInDate",
      "checkOutDate",
      "days",
      "timeIn",
      "timeOut",
      "salutation",
      "name",
      "age",
      "gender",
      "address",
      "city",
      "nationality",
      "mobileNo",
      "email",
      "phoneNo",
      "birthDate",
      "anniversary",
      "companyName",
      "companyGSTIN",
      "idProofType",
      "idProofNumber",
      "idProofImageUrl",
      "idProofImageUrl2",
      "photoUrl",
      "cameraPhotoUrl",
      "roomNo",
      "planPackage",
      "noOfAdults",
      "noOfChildren",
      "rate",
      "taxIncluded",
      "serviceCharge",
      "isLeader",
      "arrivedFrom",
      "destination",
      "remark",
      "businessSource",
      "marketSegment",
      "purposeOfVisit",
      "discountPercent",
      "discountRoomSource",
      "paymentMode",
      "paymentStatus",
      "bookingRefNo",
      "mgmtBlock",
      "billingInstruction",
      "temperature",
      "fromCSV",
      "epabx",
      "vip",
      "status",
      "createdAt",
      "updatedAt"
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(bookings);

    res.header("Content-Type", "text/csv");
    res.attachment("bookings.csv");
    return res.send(csv);
  } catch (error) {
    console.log("CSV export error:", error);
    res.status(500).json({ success: false, message: "CSV export failed" });
  }
};


  