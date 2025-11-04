const express = require("express");
const router = express.Router();
const Resident = require("../models/resident");
const Apartment = require("../models/apartment");
const auth = require("../middlewares/auth");
// const validation = require("../middlewares/validation");

router.get("/api/residents", auth.authenticateApiToken, async (req, res) => {
  try {
    const residents = await Resident.find()
      .populate("apartment")
      .sort({createdAt: -1});
    res.json(residents);
  } catch (error) {
    res.status(500).json({message: "Server error", error: error.message});
  }
});

router.get(
  "/api/residents/:id",
  auth.authenticateApiToken,
  async (req, res) => {
    try {
      const resident = await Resident.findById(req.params.id).populate(
        "apartment"
      );
      if (!resident) {
        return res.status(404).json({message: "Resident not found"});
      }
      res.json(resident);
    } catch (error) {
      res.status(500).json({message: "Server error", error: error.message});
    }
  }
);

router.post("/api/residents", auth.authenticateApiToken, async (req, res) => {
  try {
    const {residentName, yOB, apartment} = req.body;

    const existingResident = await Resident.findOne({residentName});
    if (existingResident) {
      return res
        .status(400)
        .json({message: "Resident with this name already exists"});
    }

    const apartmentExists = await Apartment.findById(apartment);
    if (!apartmentExists) {
      return res.status(400).json({message: "Invalid apartment"});
    }

    const resident = new Resident({
      residentName,
      yOB,
      apartment,
    });

    await resident.save();
    res.status(201).json(resident);
  } catch (error) {
    res.status(500).json({message: "Server error", error: error.message});
  }
});

router.put(
  "/api/residents/:id",
  auth.authenticateApiToken,
  async (req, res) => {
    try {
      const {
        residentName,
        yOB,
        apartment,
        floor,
        isOwned,
        residentDescription,
      } = req.body;

      const existingResident = await Resident.findOne({
        residentName,
        _id: {$ne: req.params.id},
      });

      if (existingResident) {
        return res
          .status(400)
          .json({message: "Resident with this name already exists"});
      }

      const apartmentExists = await Apartment.findById(apartment);
      if (!apartmentExists) {
        return res.status(400).json({message: "Invalid apartment"});
      }

      const resident = await Resident.findByIdAndUpdate(
        req.params.id,
        {
          residentName,
          yOB,
          residentDescription,
          apartment,
          floor: parseFloat(floor),
          isOwned: isOwned === "on",
        },
        {new: true, runValidators: true}
      );

      if (!resident) {
        return res.status(404).json({message: "Resident not found"});
      }

      res.json(resident);
    } catch (error) {
      res.status(500).json({message: "Server error", error: error.message});
    }
  }
);

router.delete(
  "/api/residents/:id",
  auth.authenticateApiToken,
  async (req, res) => {
    try {
      const resident = await Resident.findByIdAndDelete(req.params.id);
      if (!resident) {
        return res.status(404).json({message: "Resident not found"});
      }
      res.json({message: "Resident deleted successfully"});
    } catch (error) {
      res.status(500).json({message: "Server error", error: error.message});
    }
  }
);

router.get("/view/residents", auth.authenticateSession, async (req, res) => {
  try {
    const residents = await Resident.find()
      .populate("apartment")
      .sort({createdAt: -1});
    res.render("dashboard", {
      title: "Residents list",
      user: req.user,
      residents,
      messages: req.flash(),
    });
  } catch (error) {
    req.flash("error", "Failed to load residents");
    res.redirect("/signin");
  }
});

router.get("/residents/add", auth.authenticateSession, async (req, res) => {
  try {
    const apartments = await Apartment.find().sort({apartmentName: 1});
    res.render("residents/add", {
      title: "Add Resident",
      user: req.user,
      apartments,
      messages: req.flash(),
    });
  } catch (error) {
    req.flash("error", "Failed to load apartments");
    res.redirect("/view/residents");
  }
});

router.post("/residents/add", auth.authenticateSession, async (req, res) => {
  try {
    const {residentName, residentDescription, yOB, apartment, floor, isOwned} =
      req.body;

    if (
      !residentName ||
      !yOB ||
      !floor ||
      !yOB ||
      !apartment ||
      !residentDescription
    ) {
      req.flash("error", "All fields are required");
      return res.redirect(`/residents/add/`);
    }

    if (!/^[a-zA-Z0-9\s\/]+$/.test(residentName)) {
      req.flash(
        "error",
        "Resident name can only contain letters, numbers, spaces, and forward slashes"
      );
      return res.redirect(`/residents/add/`);
    }

    const floors = parseInt(floor);
    if (isNaN(floors) || floors < 1 || floors > 40) {
      req.flash("error", "Floor must be a number between 1 and 40");
      return res.redirect(`/residents/add/}`);
    }

    const numYOB = parseInt(yOB);
    if (isNaN(numYOB) || numYOB < 1940 || numYOB > 2026) {
      req.flash(
        "error",
        "Year of Birth must be a number between 1940 and 2025"
      );
      return res.redirect(`/residents/add/`);
    }

    const existingResident = await Resident.findOne({
      residentName,
      _id: {$ne: req.params.id},
    });

    if (existingResident) {
      req.flash("error", "Resident with this name already exists");
      return res.redirect(`/residents/add/`);
    }

    const resident = new Resident({
      residentName,
      residentDescription,
      yOB,
      apartment,
      isOwned: isOwned === "on",
      floor: floors,
    });

    await resident.save();
    req.flash("success", "Resident added successfully");
    res.redirect("/view/residents");
  } catch (error) {
    req.flash("error", "Failed to add resident: " + error.message);
    res.redirect("/residents/add");
  }
});

router.get("/residents/:id", auth.authenticateSession, async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) {
      req.flash("error", "Resident not found");
      return res.redirect("/view/residents");
    }

    const apartments = await Apartment.find().sort({name: 1});
    res.render("residents/edit", {
      title: "Resident Details",
      user: req.user,
      resident,
      apartments,
      messages: req.flash(),
    });
  } catch (error) {
    req.flash("error", "Failed to load resident");
    res.redirect("/view/residents");
  }
});

router.post("/residents/:id", auth.authenticateSession, async (req, res) => {
  try {
    const {residentName, residentDescription, yOB, apartment, floor, isOwned} =
      req.body;

    if (
      !residentName ||
      !yOB ||
      !floor ||
      !yOB ||
      !apartment ||
      !residentDescription
    ) {
      req.flash("error", "All fields are required");
      return res.redirect(`/residents/${req.params.id}`);
    }

    if (!/^[a-zA-Z0-9\s\/]+$/.test(residentName)) {
      req.flash(
        "error",
        "Resident name can only contain letters, numbers, spaces, and forward slashes"
      );
      return res.redirect(`/residents/${req.params.id}`);
    }

    const floors = parseInt(floor);
    if (isNaN(floors) || floors < 1 || floors > 40) {
      req.flash("error", "Floor must be a number between 1 and 40");
      return res.redirect(`/residents/${req.params.id}`);
    }

    const numYOB = parseInt(yOB);
    if (isNaN(numYOB) || numYOB < 1940 || numYOB > 2025) {
      req.flash(
        "error",
        "Year of Birth must be a number between 1940 and 2025"
      );
      return res.redirect(`/residents/${req.params.id}`);
    }

    const existingResident = await Resident.findOne({
      residentName,
      _id: {$ne: req.params.id},
    });

    if (existingResident) {
      req.flash("error", "Resident with this name already exists");
      return res.redirect(`/residents/${req.params.id}`);
    }

    const updatedData = {
      residentName,
      residentDescription,
      floor: floors,
      isOwned: isOwned === "on",
      residentDescription,
      apartment,
    };

    await Resident.findByIdAndUpdate(req.params.id, updatedData);
    req.flash("success", "Resident updated successfully");
    res.redirect("/view/residents");
  } catch (error) {
    req.flash("error", "Failed to update resident: " + error.message);
    res.redirect(`/residents/${req.params.id}`);
  }
});

router.post(
  "/residents/delete/:id",
  auth.authenticateSession,
  async (req, res) => {
    try {
      const resident = await Resident.findByIdAndDelete(req.params.id);
      if (!resident) {
        req.flash("error", "resident not found");
      } else {
        req.flash("success", "resident deleted successfully");
      }
      res.redirect("/view/residents");
    } catch (error) {
      req.flash("error", "Failed to delete resident");
      res.redirect("/view/residents");
    }
  }
);

module.exports = router;
