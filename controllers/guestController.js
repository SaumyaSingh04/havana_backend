import { Guest } from "../models/guest.js";

// ✅ Create or Update guest by grc + bookingId
export const upsertGuest = async (req, res) => {
  try {
    const { grcNo, bookingId, name } = req.body;

    if (!grcNo || !bookingId || !name) {
      return res.status(400).json({ error: "grcNo, bookingId, and name are required." });
    }

    const updateFields = {
      ...req.body,
      visitStats: {
        lastVisit: new Date(),
        $inc: { totalVisits: 1 }
      }
    };

    const updatedGuest = await Guest.findOneAndUpdate(
      { grcNo, bookingId },
      { $set: updateFields },
      { upsert: true, new: true }
    );

    return res.json({ success: true, guest: updatedGuest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get guest by GRC number
export const getGuestByGRC = async (req, res) => {
  try {
    const { grcNo } = req.params;
    const guest = await Guest.findOne({ grcNo });
    if (!guest) return res.status(404).json({ error: "Guest not found for this GRC." });

    return res.json({ success: true, guest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Add visit entry (uses GRC + bookingId)
export const addGuestVisit = async (req, res) => {
  try {
    const { grcNo, bookingId } = req.body;

    if (!grcNo || !bookingId) {
      return res.status(400).json({ error: "grcNo and bookingId are required" });
    }

    const guest = await Guest.findOne({ grcNo, bookingId });
    if (!guest) return res.status(404).json({ error: "Guest not found for provided GRC + Booking ID" });

    guest.visitStats.lastVisit = new Date();
    guest.visitStats.totalVisits += 1;
    await guest.save();

    return res.json({ success: true, message: "Visit updated", guest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all guests (with search, sorting, pagination)
export const getAllGuests = async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        idType,
        sortBy = "createdAt",       // field to sort by
        sortOrder = "desc",         // 'asc' or 'desc'
        page = 1,
        limit = 10
      } = req.query;
  
      const filters = {};
  
      if (name) {
        filters.name = { $regex: name, $options: "i" };
      }
  
      if (email) {
        filters['contactDetails.email'] = { $regex: email, $options: "i" };
      }
  
      if (phone) {
        filters['contactDetails.phone'] = { $regex: phone, $options: "i" };
      }
  
      if (idType) {
        filters['identityDetails.idType'] = idType;
      }
  
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortDirection = sortOrder === "asc" ? 1 : -1;
  
      // Get total count for pagination
      const total = await Guest.countDocuments(filters);
  
      // Query with filters, sorting, and pagination
      const guests = await Guest.find(filters)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(parseInt(limit));
  
      // Return paginated response
      res.json({
        success: true,
        total,
        count: guests.length,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        guests
      });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
