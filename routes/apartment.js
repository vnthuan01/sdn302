const express = require("express");
const router = express.Router();
const Apartment = require("../models/apartment");
const Resident = require("../models/resident");
const auth = require("../middlewares/auth");

router.get("/api/apartments", auth.authenticateApiToken, async (req, res) => {
  try {
    const apartments = await Apartment.find().sort({ apartmentName: 1 });
    res.json(apartments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get(
  "/api/apartments/:id",
  auth.authenticateApiToken,
  async (req, res) => {
    try {
      const apartment = await Apartment.findById(req.params.id);
      if (!apartment) {
        return res.status(404).json({ message: "Apartment not found" });
      }
      res.json(apartment);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

router.post("/api/apartments", auth.authenticateApiToken, async (req, res) => {
  try {
    const { apartmentName, totalOfFloors } = req.body;

    const existingApartment = await Apartment.findOne({ apartmentNameName });
    if (existingApartment) {
      return res
        .status(400)
        .json({ message: "Apartment with this name already exists" });
    }

    const apartment = new Apartment({
      apartmentName,
      totalOfFloors,
    });

    await apartment.save();
    res.status(201).json(apartment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.put(
  "/api/apartments/:id",
  auth.authenticateApiToken,
  async (req, res) => {
    try {
      const { apartmentName, totalOfFloors } = req.body;

      const existingApartment = await Apartment.findOne({
        apartmentName,
        _id: { $ne: req.params.id },
      });

      console.log(existingApartment);

      if (existingApartment) {
        return res
          .status(400)
          .json({ message: "Apartment with this name already exists" });
      }

      const apartment = await Apartment.findByIdAndUpdate(
        req.params.id,
        { apartmentName, totalOfFloors: parseInt(totalOfFloors, 10) },
        { new: true, runValidators: true }
      );

      if (!apartment) {
        return res.status(404).json({ message: "Apartment not found" });
      }

      res.json(apartment);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

router.delete(
  "/api/apartments/:id",
  auth.authenticateApiToken,
  async (req, res) => {
    try {
      const apartment = await Apartment.findByIdAndDelete(req.params.id);
      if (!apartment) {
        return res.status(404).json({ message: "Apartment not found" });
      }

      const existResident = await Resident.countDocuments({
        apartment: req.params.id,
      });
      if (existResident) {
        return res.status(403).json({
          message: "Can't not delete apartment with existed Residents in.",
        });
      }
      res.json({ message: "Apartment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

module.exports = router;
