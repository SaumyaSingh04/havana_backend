import { Booking } from "../models/booking.js";
import ExcelJS from "exceljs";

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
export const exportBookingsExcel = async (req, res) => {
  try {
    const bookings = await Booking.find().lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Bookings");

    // Define columns based on schema
    worksheet.columns = [
      { header: "GRC No", key: "grcNo", width: 15 },
      { header: "Booking Date", key: "bookingDate", width: 20 },
      { header: "Check-In Date", key: "checkInDate", width: 20 },
      { header: "Check-Out Date", key: "checkOutDate", width: 20 },
      { header: "Days", key: "days", width: 10 },
      { header: "Time In", key: "timeIn", width: 10 },
      { header: "Time Out", key: "timeOut", width: 10 },
      { header: "Salutation", key: "salutation", width: 10 },
      { header: "Name", key: "name", width: 20 },
      { header: "Age", key: "age", width: 10 },
      { header: "Gender", key: "gender", width: 10 },
      { header: "Address", key: "address", width: 30 },
      { header: "City", key: "city", width: 15 },
      { header: "Nationality", key: "nationality", width: 15 },
      { header: "Mobile No", key: "mobileNo", width: 15 },
      { header: "Email", key: "email", width: 20 },
      { header: "Phone No", key: "phoneNo", width: 15 },
      { header: "Birth Date", key: "birthDate", width: 15 },
      { header: "Anniversary", key: "anniversary", width: 15 },
      { header: "Company Name", key: "companyName", width: 20 },
      { header: "Company GSTIN", key: "companyGSTIN", width: 20 },
      { header: "ID Type", key: "idProofType", width: 15 },
      { header: "ID Number", key: "idProofNumber", width: 20 },
      { header: "ID Image 1", key: "idProofImageUrl", width: 30 },
      { header: "ID Image 2", key: "idProofImageUrl2", width: 30 },
      { header: "Photo", key: "photoUrl", width: 30 },
      { header: "Camera Photo", key: "cameraPhotoUrl", width: 30 },
      { header: "Room No", key: "roomNo", width: 10 },
      { header: "Plan Package", key: "planPackage", width: 15 },
      { header: "No. of Adults", key: "noOfAdults", width: 10 },
      { header: "No. of Children", key: "noOfChildren", width: 10 },
      { header: "Rate", key: "rate", width: 10 },
      { header: "Tax Included", key: "taxIncluded", width: 10 },
      { header: "Service Charge", key: "serviceCharge", width: 10 },
      { header: "Is Leader", key: "isLeader", width: 10 },
      { header: "Arrived From", key: "arrivedFrom", width: 15 },
      { header: "Destination", key: "destination", width: 15 },
      { header: "Remark", key: "remark", width: 20 },
      { header: "Business Source", key: "businessSource", width: 20 },
      { header: "Market Segment", key: "marketSegment", width: 20 },
      { header: "Purpose of Visit", key: "purposeOfVisit", width: 20 },
      { header: "Discount (%)", key: "discountPercent", width: 10 },
      { header: "Discount Source", key: "discountRoomSource", width: 10 },
      { header: "Payment Mode", key: "paymentMode", width: 15 },
      { header: "Payment Status", key: "paymentStatus", width: 15 },
      { header: "Booking Ref No", key: "bookingRefNo", width: 20 },
      { header: "Mgmt Block", key: "mgmtBlock", width: 10 },
      { header: "Billing Instruction", key: "billingInstruction", width: 25 },
      { header: "Temperature", key: "temperature", width: 10 },
      { header: "From CSV", key: "fromCSV", width: 10 },
      { header: "EPABX", key: "epabx", width: 10 },
      { header: "VIP", key: "vip", width: 10 },
      { header: "Status", key: "status", width: 15 },
      { header: "Created At", key: "createdAt", width: 20 },
      { header: "Updated At", key: "updatedAt", width: 20 },
    ];

    // Add rows
    bookings.forEach((booking) => {
      worksheet.addRow(booking);
    });

    // Set header for download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=bookings.xlsx");

    // Send the Excel file
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Excel export error:", error);
    res.status(500).json({ success: false, message: "Excel export failed" });
  }
};

export const uploadCameraPhoto = async (req, res) => {
  try {
    const cameraPhotoUrl = req.files?.cameraPhoto?.[0]?.path;

    if (!cameraPhotoUrl) {
      return res.status(400).json({ success: false, message: "No webcam photo uploaded" });
    }

    res.status(200).json({
      success: true,
      message: "Webcam photo uploaded successfully",
      url: cameraPhotoUrl,
    });
  } catch (error) {
    console.error("Webcam upload error:", error);
    res.status(500).json({ success: false, message: "Failed to upload webcam photo" });
  }
};
