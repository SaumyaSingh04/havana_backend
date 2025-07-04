import { Booking } from "../models/booking.js";
import ExcelJS from "exceljs";

// Trim helper
const cleanInput = (input) => {
  if (!input || typeof input !== "string") return input;
  return input.trim();
};

// ✅ CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    const body = req.body;

    const count = await Booking.countDocuments();
    const newGrcNo = `GRC-${String(count + 1).padStart(3, "0")}`;

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

    // ✅ Handle images
    const photoUrl = req.files?.photoUrl?.[0]?.path;
    const idProofImageUrl = req.files?.idProofImageUrl?.[0]?.path;
    const idProofImageUrl2 = req.files?.idProofImageUrl2?.[0]?.path;

    const newBooking = new Booking({
      ...cleanedBody,
      photoUrl,
      idProofImageUrl,
      idProofImageUrl2,
    });

    await newBooking.save();
    res.status(201).json({ success: true, booking: newBooking });
  } catch (error) {
    console.log("Create booking error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ UPDATE BOOKING
export const updateBooking = async (req, res) => {
  try {
    const updatedBody = {};

    for (const key in req.body) {
      updatedBody[key] =
        typeof req.body[key] === "string" ? req.body[key].trim() : req.body[key];
    }

    if (req.files?.photoUrl?.[0]?.path) {
      updatedBody.photoUrl = req.files.photoUrl[0].path;
    }
    if (req.files?.idProofImageUrl?.[0]?.path) {
      updatedBody.idProofImageUrl = req.files.idProofImageUrl[0].path;
    }
    if (req.files?.idProofImageUrl2?.[0]?.path) {
      updatedBody.idProofImageUrl2 = req.files.idProofImageUrl2[0].path;
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, updatedBody, {
      new: true,
    });

    res.json({ success: true, booking });
  } catch (error) {
    console.log("Update booking error:", error);
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

    worksheet.columns = [
      { header: "GRC No", key: "grcNo" },
      { header: "Booking Date", key: "bookingDate" },
      { header: "Check-In Date", key: "checkInDate" },
      { header: "Check-Out Date", key: "checkOutDate" },
      { header: "Days", key: "days" },
      { header: "Time In", key: "timeIn" },
      { header: "Time Out", key: "timeOut" },
      { header: "Salutation", key: "salutation" },
      { header: "Name", key: "name" },
      { header: "Age", key: "age" },
      { header: "Gender", key: "gender" },
      { header: "Address", key: "address" },
      { header: "City", key: "city" },
      { header: "Nationality", key: "nationality" },
      { header: "Mobile No", key: "mobileNo" },
      { header: "Email", key: "email" },
      { header: "Phone No", key: "phoneNo" },
      { header: "Birth Date", key: "birthDate" },
      { header: "Anniversary", key: "anniversary" },
      { header: "Company Name", key: "companyName" },
      { header: "Company GSTIN", key: "companyGSTIN" },
      { header: "ID Proof Type", key: "idProofType" },
      { header: "ID Proof Number", key: "idProofNumber" },
      { header: "Photo URL", key: "photoUrl" },
      { header: "ID Proof Image 1", key: "idProofImageUrl" },
      { header: "ID Proof Image 2", key: "idProofImageUrl2" },
      { header: "Room No", key: "roomNo" },
      { header: "Plan Package", key: "planPackage" },
      { header: "Adults", key: "noOfAdults" },
      { header: "Children", key: "noOfChildren" },
      { header: "Rate", key: "rate" },
      { header: "Tax Included", key: "taxIncluded" },
      { header: "Service Charge", key: "serviceCharge" },
      { header: "Leader", key: "isLeader" },
      { header: "Arrived From", key: "arrivedFrom" },
      { header: "Destination", key: "destination" },
      { header: "Remark", key: "remark" },
      { header: "Business Source", key: "businessSource" },
      { header: "Market Segment", key: "marketSegment" },
      { header: "Purpose of Visit", key: "purposeOfVisit" },
      { header: "Discount %", key: "discountPercent" },
      { header: "Discount Source", key: "discountRoomSource" },
      { header: "Payment Mode", key: "paymentMode" },
      { header: "Payment Status", key: "paymentStatus" },
      { header: "Booking Ref No", key: "bookingRefNo" },
      { header: "Mgmt Block", key: "mgmtBlock" },
      { header: "Billing Instruction", key: "billingInstruction" },
      { header: "Temperature", key: "temperature" },
      { header: "From CSV", key: "fromCSV" },
      { header: "EPABX", key: "epabx" },
      { header: "VIP", key: "vip" },
      { header: "Status", key: "status" },
      { header: "Created At", key: "createdAt" },
    ];
    

    bookings.forEach((b) => {
      worksheet.addRow({
        ...b,
        bookingDate: b.bookingDate ? new Date(b.bookingDate).toLocaleString() : "",
    checkInDate: b.checkInDate ? new Date(b.checkInDate).toLocaleString() : "",
    checkOutDate: b.checkOutDate ? new Date(b.checkOutDate).toLocaleString() : "",
    birthDate: b.birthDate ? new Date(b.birthDate).toLocaleDateString() : "",
    anniversary: b.anniversary ? new Date(b.anniversary).toLocaleDateString() : "",
    createdAt: b.createdAt ? new Date(b.createdAt).toLocaleString() : "",
      });
    });

    // 🔥 FIX: Write to buffer first (no stream issues)
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=bookings.xlsx"
    );
    res.setHeader("Content-Length", buffer.length);

    res.send(buffer); // ✅ send buffer instead of stream
  } catch (error) {
    console.error("Excel export error:", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Excel export failed" });
    }
  }
};

// export const uploadCameraPhoto = async (req, res) => {
//   try {
//     const file = req.files?.cameraPhotoUrl?.[0];
//     if (!file) {
//       return res
//         .status(400)
//         .json({ success: false, message: "No webcam photo uploaded" });
//     }

//     res.status(200).json({ success: true, photoUrl: file.path });
//   } catch (error) {
//     console.error("Upload webcam photo error:", error);
//     res
//       .status(500)
//       .json({ success: false, message: error.message });
//   }
// };
