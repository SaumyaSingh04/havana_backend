import { Booking } from "../models/booking.js";
import { Guest } from "../models/guest.js";
import { Room } from "../models/room.js";
import { RoomCategory } from "../models/roomCategory.js";
import { Reservation } from "../models/reservation.js";
import { upsertGuestOnBooking } from "./guestController.js";

// 🔧 Utility: Helpers
const generateCode = () => Math.floor(1000 + Math.random() * 9000);
const generateBookingRefNo = () => {
  const now = new Date();
  const date = now.toISOString().split("T")[0].replace(/-/g, "");
  return `BKG-${date}-${generateCode()}`;
};
const generateGRC = async () => {
  let exists = true, grcNo;
  while (exists) {
    grcNo = `GRC-${generateCode()}`;
    exists = await Booking.findOne({ grcNo });
  }
  return grcNo;
};

// ✅ CREATE BOOKING
export const bookRoom = async (req, res) => {
  try {
    const isMultipleBooking = Array.isArray(req.body.bookings);

    const handleBooking = async (categoryId, count, extras = {}) => {
      // Validate category
      const category = await RoomCategory.findById(categoryId);
      if (!category) throw new Error("Category not found");

      // Find guest
      let guestId = null;
      let grcNo = extras.grcNo; // initialize from reservation or generate later
      
      // Generate grcNo early if this is a walk-in
      if (!extras.reservationId && !grcNo) {
        grcNo = await generateGRC();
      }
      
      // Storing back for later use
      extras.grcNo = grcNo;
      
      if (extras?.contactDetails?.phone) {
        const existingGuest = await Guest.findOne({ "contactDetails.phone": extras.contactDetails.phone });
      
        if (!existingGuest) {
          const newGuest = await Guest.create({
            grcNo,
            bookingRefNo: "N/A", // Will be updated later
            name: extras.guestDetails?.name,
            salutation: extras.guestDetails?.salutation,
            gender: extras.guestDetails?.gender,
            age: extras.guestDetails?.age,
            photoUrl: extras.guestDetails?.photoUrl,
            contactDetails: extras.contactDetails,
            identityDetails: extras.identityDetails,
            visitStats: {
              lastVisit: new Date(),
              totalVisits: 1
            }
          });
          guestId = newGuest._id;
        } else {
          guestId = existingGuest._id;
        }
      }      

      // Find rooms
      let availableRooms = [];
      if (extras.roomAssigned) {
        const fixedRoom = await Room.findById(extras.roomAssigned);
        if (!fixedRoom || !["available", "reserved"].includes(fixedRoom.status)) {
          throw new Error(`Assigned room (${fixedRoom.room_number}) is not available`);
        }
        availableRooms = [fixedRoom];
      } else {
        availableRooms = await Room.find({ category: categoryId, status: "available" }).limit(count);
        if (availableRooms.length < count) {
          throw new Error(`Only ${availableRooms.length} room(s) available in this category`);
        }
      }

      const newBookings = [];

      // Loop and book each room
      for (const room of availableRooms) {
        let grcNo, bookingRefNo;

        // Use existing reservation info if present
        if (extras.reservationId) {
          const reservation = await Reservation.findById(extras.reservationId);
          if (!reservation) throw new Error("Invalid reservation ID");

          grcNo = reservation.grcNo;
          bookingRefNo = reservation.bookingRefNo;

          reservation.status = "Confirmed";
          reservation.bookingDate = new Date();
          reservation.b_timestamp = Math.floor(Date.now() / 1000);
          await reservation.save();
        } else {
          grcNo = await generateGRC();
          bookingRefNo = generateBookingRefNo();
        }

        // Create booking
        const booking = new Booking({
          grcNo,
          bookingRefNo,
          reservationId: extras.reservationId || null,
          guestId,
          categoryId,
          roomNumber: room.room_number,
          numberOfRooms: 1,
          isActive: true,
          b_timestamp: Math.floor(Date.now() / 1000),
          guestDetails: extras.guestDetails,
          contactDetails: extras.contactDetails,
          identityDetails: extras.identityDetails,
          bookingInfo: extras.bookingInfo,
          paymentDetails: extras.paymentDetails,
          vehicleDetails: extras.vehicleDetails || {},
          vip: extras.vip || false,
          isForeignGuest: extras.isForeignGuest || false,
        });

        await booking.save();
        await upsertGuestOnBooking({
          grcNo,
          bookingRefNo,
          guestDetails,
          contactDetails,
          identityDetails
        });
        room.status = "booked";
        await room.save();

        newBookings.push(booking);
      }

      return newBookings;
    };

    // ✅ MULTIPLE BOOKINGS ARRAY
    if (isMultipleBooking) {
      const results = [];
      for (const item of req.body.bookings) {
        const { categoryId, count = 1, ...extras } = item;
        if (!categoryId) throw new Error("categoryId is required in each booking");
        const bookings = await handleBooking(categoryId, count, extras);
        results.push(...bookings);
      }

      return res.status(201).json({
        success: true,
        message: `Multiple room(s) booked successfully`,
        bookings: results
      });
    }

    // ✅ SINGLE BOOKING
    const {
      categoryId,
      count = 1,
      guestDetails,
      contactDetails,
      identityDetails,
      bookingInfo,
      paymentDetails,
      vehicleDetails,
      vip,
      isForeignGuest,
      reservationId,
      roomAssigned
    } = req.body;

    if (!categoryId) return res.status(400).json({ error: "categoryId is required" });

    const singleBookings = await handleBooking(categoryId, count, {
      guestDetails,
      contactDetails,
      identityDetails,
      bookingInfo,
      paymentDetails,
      vehicleDetails,
      vip,
      isForeignGuest,
      reservationId,
      roomAssigned
    });

    return res.status(201).json({
      success: true,
      message: "Room(s) booked successfully",
      bookings: singleBookings
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

//get all
export const getBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search = "",
      status,
      categoryId,
      grcNo,
      bookingRefNo
    } = req.query;

    // ✅ Filters
    const filter = req.query.all === "true" ? {} : { isActive: true };

    // ✅ Search logic
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { "guestDetails.name": { $regex: regex } },
        { "contactDetails.phone": { $regex: regex } },
        { "contactDetails.email": { $regex: regex } },
        { "grcNo": { $regex: regex } },
        { "bookingRefNo": { $regex: regex } }
      ];
    }

    // ✅ Other filters if provided explicitly
    if (status) filter.status = status;
    if (categoryId) filter.categoryId = categoryId;
    if (grcNo) filter.grcNo = grcNo;
    if (bookingRefNo) filter.bookingRefNo = bookingRefNo;

    // ✅ Pagination setup
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    // ✅ Sort direction
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sort = { [sortBy]: sortDirection };

    // ✅ Query bookings
    const [total, bookings] = await Promise.all([
      Booking.countDocuments(filter),
      Booking.find(filter)
        .populate("categoryId")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
    ]);

    res.json({
      success: true,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get 🧾 guest info — supports reservationId / grcNo
export const getGuestPrefillInfo = async (req, res) => {
  try {
    const { grcNo, reservationId } = req.query;

    if (reservationId) {
      const resv = await Reservation.findById(reservationId);
      if (!resv) return res.status(404).json({ error: "Reservation not found" });

      return res.json({
        success: true,
        guestDetails: {
          salutation: resv.salutation,
          name: resv.guestName
        },
        contactDetails: {
          phone: resv.phoneNo || resv.mobileNo,
          email: resv.email,
          address: resv.address,
          city: resv.city,
          state: resv.state || '',
          country: resv.country || '',
          pinCode: resv.pinCode || ''
        },
        bookingInfo: {
          checkIn: resv.checkInDate,
          checkOut: resv.checkOutDate,
          arrivalFrom: resv.arrivalFrom,
          purposeOfVisit: resv.purposeOfVisit,
          bookingType: resv.reservationType,
          remarks: resv.remarks || ''
        },
        reservationId: resv._id,
        categoryId: resv.category,
        roomAssigned: resv.roomAssigned || null
      });
    }

    if (grcNo) {
      const booking = await Booking.findOne({ grcNo, isActive: true });
      if (!booking) return res.status(404).json({ error: "Guest not found" });
      const { guestDetails, contactDetails, identityDetails } = booking;
      return res.json({ success: true, guestDetails, contactDetails, identityDetails });
    }

    return res.status(400).json({ error: "Provide grcNo or reservationId" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get complete profile by bookingRef + grc
export const getGuestInfoByBookingRefAndGRC = async (req, res) => {
  try {
    const { bookingRefNo, grcNo } = req.query;
    if (!bookingRefNo || !grcNo) return res.status(400).json({ error: "Missing bookingRefNo or grcNo" });

    const booking = await Booking.findOne({ bookingRefNo, grcNo }).populate("categoryId");
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const {
      guestDetails, contactDetails, identityDetails, bookingInfo,
      paymentDetails, vehicleDetails, status
    } = booking;

    res.json({
      success: true,
      guestDetails,
      contactDetails,
      identityDetails,
      bookingInfo,
      paymentDetails,
      vehicleDetails,
      bookingStatus: status,
      category: booking.categoryId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Booking Info by ID / GRC / Category — dynamic query
export const getBookingInfo = async (req, res) => {
  try {
    const { bookingId, grcNo, categoryId } = req.query;

    let query = {};
    if (bookingId) query._id = bookingId;
    if (grcNo) query.grcNo = grcNo;
    if (categoryId) query.categoryId = categoryId;

    if (Object.keys(query).length === 0) {
      return res.status(400).json({ error: "Pass bookingId, grcNo or categoryId" });
    }

    if (categoryId) {
      const bookings = await Booking.find(query).populate("categoryId");
      return res.json({ success: true, bookings });
    } else {
      const booking = await Booking.findOne(query).populate("categoryId");
      if (!booking) return res.status(404).json({ error: "Booking not found" });
      return res.json({ success: true, booking });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Unbook (soft delete)
export const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (!booking.isActive) {
      return res.status(400).json({ error: 'Booking already inactive' });
    }

    booking.isActive = false;
    await booking.save();

    await Room.findOneAndUpdate(
      { category: booking.category, room_number: String(booking.roomNumber) },
      { status: "available" }
    );

    res.json({ success: true, message: 'Booking unbooked (marked inactive)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 PERMANENT DELETE
export const permanentlyDeleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const deleted = await Booking.findByIdAndDelete(bookingId);
    if (!deleted) return res.status(404).json({ error: 'Booking not found' });

    res.json({ success: true, message: 'Booking permanently deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Update booking
export const updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const updates = req.body;

    const restrictedFields = ['isActive', 'referenceNumber', 'createdAt', '_id', 'grcNo'];
    restrictedFields.forEach(field => delete updates[field]);

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (updates.guestDetails) {
      if (!booking.guestDetails) booking.guestDetails = {};
      Object.assign(booking.guestDetails, updates.guestDetails);
    }

    if (updates.contactDetails) {
      if (!booking.contactDetails) booking.contactDetails = {};
      Object.assign(booking.contactDetails, updates.contactDetails);
    }

    if (updates.identityDetails) {
      if (!booking.identityDetails) booking.identityDetails = {};
      Object.assign(booking.identityDetails, updates.identityDetails);
    }

    if (updates.bookingInfo) {
      if (!booking.bookingInfo) booking.bookingInfo = {};
      Object.assign(booking.bookingInfo, updates.bookingInfo);
    }

    if (updates.paymentDetails) {
      if (!booking.paymentDetails) booking.paymentDetails = {};
      Object.assign(booking.paymentDetails, updates.paymentDetails);
    }

    if (updates.vehicleDetails) {
      if (!booking.vehicleDetails) booking.vehicleDetails = {};
      Object.assign(booking.vehicleDetails, updates.vehicleDetails);
    }

    if (updates.roomNumber) booking.roomNumber = updates.roomNumber;
    if (updates.numberOfRooms) booking.numberOfRooms = updates.numberOfRooms;
    if (typeof updates.vip !== 'undefined') booking.vip = updates.vip;
    if (updates.reservationId) booking.reservationId = updates.reservationId;
    if (updates.status) booking.status = updates.status;

    if (updates.actualCheckInTime) booking.bookingInfo.actualCheckInTime = new Date(updates.actualCheckInTime);
    if (updates.actualCheckOutTime) booking.bookingInfo.actualCheckOutTime = new Date(updates.actualCheckOutTime);

    if (updates.extendedCheckOut) {
      const originalCheckIn = booking.bookingInfo.checkIn;
      const originalCheckOut = booking.bookingInfo.checkOut;

      booking.extensionHistory.push({
        originalCheckIn,
        originalCheckOut,
        extendedCheckOut: new Date(updates.extendedCheckOut),
        reason: updates.reason,
        additionalAmount: updates.additionalAmount,
        paymentMode: updates.paymentMode,
        approvedBy: updates.approvedBy
      });

      booking.bookingInfo.checkOut = new Date(updates.extendedCheckOut);

      if (updates.additionalAmount) {
        booking.paymentDetails.totalAmount = (booking.paymentDetails.totalAmount || 0) + updates.additionalAmount;
      }
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Extend booking stay
export const extendBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { extendedCheckOut, reason, additionalAmount, paymentMode, approvedBy } = req.body;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    if (!booking.isActive) {
      return res.status(400).json({ error: 'Cannot extend inactive booking' });
    }
    
    const originalCheckIn = booking.bookingInfo.checkIn;
    const originalCheckOut = booking.bookingInfo.checkOut;

    booking.extensionHistory.push({
      originalCheckIn,
      originalCheckOut,
      extendedCheckOut: new Date(extendedCheckOut),
      reason,
      additionalAmount,
      paymentMode,
      approvedBy
    });
    
    booking.bookingInfo.checkOut = new Date(extendedCheckOut);
    
    if (additionalAmount) {
      booking.paymentDetails.totalAmount = 
        (booking.paymentDetails.totalAmount || 0) + additionalAmount;
    }
    
    await booking.save();
    
    res.json({ 
      success: true, 
      message: 'Booking extended successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Finalize guest check-out
export const checkoutBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (!booking.isActive) {
      return res.status(400).json({ error: "Cannot checkout an inactive booking" });
    }

    booking.status = "Checked Out";
    booking.bookingInfo.actualCheckOutTime = new Date();
    booking.isActive = false;

    // Release room
    await Room.findOneAndUpdate(
      { room_number: booking.roomNumber, category: booking.category },
      { status: 'available' }
    );

    await booking.save();

    res.json({ success: true, message: "Guest checked out successfully", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
