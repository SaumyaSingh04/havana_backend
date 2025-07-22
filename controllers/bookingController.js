import { Booking } from "../models/booking.js";
import { Room } from "../models/room.js";
import { RoomCategory } from "../models/roomCategory.js";

// 🔹 Generate unique GRC number
const generateGRC = async () => {
  let grcNo = "";
  let exists = true;

  while (exists) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    grcNo = `GRC-${rand}`;
    exists = await Booking.findOne({ grcNo });
  }

  return grcNo;
};

// 🔹 Book Room (Single/Multiple)
export const bookRoom = async (req, res) => {
  try {
    const handleBooking = async (categoryId, count, extraDetails = {}) => {
      const category = await RoomCategory.findById(categoryId);
      if (!category) throw new Error(`Category not found: ${categoryId}`);
    
      let availableRooms = [];
    
      // 👇 UPDATED LOGIC: Respect fixed room (from reservation) if provided!
      if (extraDetails.roomAssigned) {
        const fixedRoom = await Room.findById(extraDetails.roomAssigned);
        if (!fixedRoom) throw new Error("Assigned room not found.");
        if (fixedRoom.status !== 'available' && fixedRoom.status !== 'reserved') {
          throw new Error(`Assigned room (${fixedRoom.room_number}) is not available or reserved`);
        }
        availableRooms = [fixedRoom];
      } else {
        availableRooms = await Room.find({
          category: categoryId,
          status: 'available'
        }).limit(count);
    
        if (availableRooms.length < count) {
          throw new Error(`Not enough available rooms in ${category.category}`);
        }
      }
    
      const bookedRoomNumbers = [];
      const newBookings = [];
    
      for (let room of availableRooms) {
        const newGRC = await generateGRC();
        const booking = new Booking({
          grcNo: newGRC,
          reservationId: extraDetails.reservationId || null,
          guestId: extraDetails.guestId || null,
          category: categoryId,
          roomNumber: room.room_number,
          isActive: true,
          numberOfRooms: 1,
          referenceNumber: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
          guestDetails: extraDetails.guestDetails,
          contactDetails: extraDetails.contactDetails,
          identityDetails: extraDetails.identityDetails,
          bookingInfo: extraDetails.bookingInfo,
          paymentDetails: extraDetails.paymentDetails,
          vehicleDetails: extraDetails.vehicleDetails || {},
          vip: extraDetails.vip || false
        });
    
        await booking.save();
    
        // Room is now booked
        room.status = 'booked';
        await room.save();
    
        bookedRoomNumbers.push(room.room_number);
        newBookings.push(booking);
      }
    
      return newBookings;
    };    

    // 🔹 Multiple Bookings
    if (Array.isArray(req.body.bookings)) {
      const results = [];
      for (const item of req.body.bookings) {
        const { categoryId, count, ...extraDetails } = item;
        const bookings = await handleBooking(categoryId, count, extraDetails);
        results.push(...bookings);
      }
      return res.status(201).json({ success: true, booked: results });
    }

    // 🔹 Single Booking
    const {
      categoryId,
      count,
      guestDetails,
      contactDetails,
      identityDetails,
      bookingInfo,
      paymentDetails,
      vehicleDetails,
      vip,
      reservationId,
      guestId
    } = req.body;

    if (!categoryId) return res.status(400).json({ error: "categoryId is required" });

    const numRooms = Number.isInteger(count) && count > 0 ? count : 1;

    const bookings = await handleBooking(categoryId, numRooms, {
      guestDetails,
      contactDetails,
      identityDetails,
      bookingInfo,
      paymentDetails,
      vehicleDetails,
      vip,
      reservationId,
      guestId
    });

    return res.status(201).json({ success: true, booked: bookings });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

// 🔹 Get all bookings
export const getBookings = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const bookings = await Booking.find(filter).populate('categoryId');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Get Booking by GRC
export const getBookingByGRC = async (req, res) => {
  try {
    const { grcNo } = req.params;
    const booking = await Booking.findOne({ grcNo }).populate('categoryId');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    res.json({ success: true, booking });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// 🔹 Get guest basic info by GRC (for rebooking)
export const getGuestInfoByGRC = async (req, res) => {
  try {
    const { grcNo } = req.params;
    const booking = await Booking.findOne({ grcNo });
    if (!booking) return res.status(404).json({ error: 'Guest not found' });

    const { guestDetails, contactDetails, identityDetails } = booking;
    res.json({ success: true, guestDetails, contactDetails, identityDetails });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// 🔹 Get full guest profile by bookingId + GRC (for validation)
export const getGuestInfoByBookingIdAndGRC = async (req, res) => {
  try {
    const { bookingId, grcNo } = req.query;
    if (!bookingId || !grcNo) return res.status(400).json({ error: "bookingId and grcNo required" });

    const booking = await Booking.findOne({ _id: bookingId, grcNo });
    if (!booking) return res.status(404).json({ error: "Guest not found" });

    const {
      guestDetails,
      contactDetails,
      identityDetails,
      bookingInfo,
      paymentDetails,
      vehicleDetails,
      status
    } = booking;

    res.json({
      success: true,
      guestDetails,
      contactDetails,
      identityDetails,
      bookingInfo,
      paymentDetails,
      vehicleDetails,
      bookingStatus: status
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// 🔹 Get bookings by category
export const getBookingsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const bookings = await Booking.find({ category: categoryId }).populate('categoryId');
    
    const safeBookings = bookings.map(booking => {
      const bookingObj = booking.toObject();
      if (!bookingObj.categoryId) {
        bookingObj.categoryId = { name: 'Unknown' };
      }
      return bookingObj;
    });
    
    res.json(safeBookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// 🔹 Get booking by Booking ID
export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate('categoryId');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const result = booking.toObject();
    if (!result.categoryId) result.categoryId = { name: 'Unknown' };

    res.json({ success: true, booking: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get booking by id and grc
export const getBookingByIdAndGRC = async (req, res) => {
  try {
    const { bookingId, grcNo } = req.query;

    if (!bookingId || !grcNo) {
      return res.status(400).json({ error: 'Both bookingId and grcNo are required' });
    }

    const booking = await Booking.findOne({ _id: bookingId, grcNo }).populate('categoryId');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found with provided bookingId and grcNo' });
    }

    const result = booking.toObject();
    if (!result.categoryId) result.categoryId = { name: 'Unknown' };

    res.json({ success: true, booking: result });

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
