import { Guest } from "../models/guest.js";

// ✅ Manual Upsert (API: /api/guests/upsert)
export const upsertGuest = async (req, res) => {
  try {
    const { grcNo, bookingRefNo, name } = req.body;

    if (!grcNo || !bookingRefNo || !name) {
      return res.status(400).json({
        error: "grcNo, bookingRefNo, and name are required.",
      });
    }

    const updateFields = {
      grcNo,
      bookingRefNo,
      salutation: req.body.salutation,
      name,
      age: req.body.age,
      gender: req.body.gender,
      photoUrl: req.body.photoUrl,

      contactDetails: req.body.contactDetails,
      identityDetails: req.body.identityDetails,

      "visitStats.lastVisit": new Date()
    };

    const guest = await Guest.findOneAndUpdate(
      { grcNo, bookingRefNo },
      {
        $set: updateFields,
        $inc: { "visitStats.totalVisits": 1 }
      },
      { upsert: true, new: true }
    );

    return res.json({ success: true, guest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ▶ Automatically create or update Guest during booking
export const upsertGuestOnBooking = async (booking = {}) => {
  try {
    const {
      grcNo,
      bookingRefNo,
      guestDetails = {},
      contactDetails = {},
      identityDetails = {}
    } = booking;

    // 🛑 Validate required identifiers
    if (!grcNo?.trim() || !bookingRefNo?.trim()) {
      console.warn("⛔ Skipping guest upsert: missing grcNo or bookingRefNo");
      return;
    }

    // 📝 Build update payload
    const updateFields = {
      salutation: guestDetails.salutation || null,
      name: guestDetails.name || "Unknown Guest",
      age: guestDetails.age || null,
      gender: guestDetails.gender || null,
      photoUrl: guestDetails.photoUrl || null,

      contactDetails: {
        phone: contactDetails.phone || null,
        email: contactDetails.email || null,
        address: contactDetails.address || "",
        city: contactDetails.city || "",
        state: contactDetails.state || "",
        country: contactDetails.country || "",
        pinCode: contactDetails.pinCode || ""
      },

      identityDetails: {
        idType: identityDetails?.idType || null,
        idNumber: identityDetails?.idNumber || null,
        idPhotoFront: identityDetails?.idPhotoFront || null,
        idPhotoBack: identityDetails?.idPhotoBack || null
      },

      "visitStats.lastVisit": new Date()
    };

    // ✅ Upsert Guest (match by grc + bookingRef)
    const result = await Guest.findOneAndUpdate(
      { grcNo, bookingRefNo },
      {
        $set: updateFields,
        $inc: { "visitStats.totalVisits": 1 }
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Guest upserted for GRC: ${grcNo}, Ref: ${bookingRefNo}`);

    return result;
  } catch (error) {
    console.error("🚨 Guest Upsert From Booking Error:", error.message);
  }
};


// ✅ Get guest by GRC
export const getGuestByGRC = async (req, res) => {
  try {
    const { grcNo } = req.params;
    const guest = await Guest.findOne({ grcNo });
    if (!guest) {
      return res.status(404).json({ error: "Guest not found for this GRC." });
    }
    return res.json({ success: true, guest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Add Visit (Manual prompt for rebooking etc.)
export const addGuestVisit = async (req, res) => {
  try {
    const { grcNo, bookingRefNo } = req.body;

    if (!grcNo || !bookingRefNo) {
      return res.status(400).json({ error: "grcNo and bookingRefNo are required." });
    }

    const guest = await Guest.findOne({ grcNo, bookingRefNo });

    if (!guest) return res.status(404).json({ error: "Guest not found." });

    guest.visitStats.lastVisit = new Date();
    guest.visitStats.totalVisits += 1;
    await guest.save();

    return res.json({ success: true, message: "Visit count updated", guest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Paginated Guest List
export const getAllGuests = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      idType,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10
    } = req.query;

    const filters = {};
    if (name) filters.name = { $regex: name, $options: "i" };
    if (email) filters["contactDetails.email"] = { $regex: email, $options: "i" };
    if (phone) filters["contactDetails.phone"] = { $regex: phone, $options: "i" };
    if (idType) filters["identityDetails.idType"] = idType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const total = await Guest.countDocuments(filters);
    const guests = await Guest.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      guests,
      count: guests.length,
      page: +page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
