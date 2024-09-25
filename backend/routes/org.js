const express = require("express");
const Org = require("../models/Org");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const checkAdmin = require("../middleware/checkAdmin");
const User = require("../models/User");

const router = express.Router();

router.post("/add-org", checkAdmin, async (req, res) => {
  let success = false;
  try {
    const { name } = req.body;
    const creatorId = req.user.id;
    if (!name || !creatorId)
      return res.status(400).json({ msg: "Please fill all the fields" });

    const org = await Org.create({
      creator: creatorId,
      name: name,
      admin: [creatorId],
    });
    success = true;
    res.status(200).json({
      success,
      org,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

router.post("/add-admins", checkAdmin, async (req, res) => {
  let success = false;
  try {
    const { admins } = req.body;
    const userId = req.user.id;
    const org = await Org.findOne({ creator: userId });
    if (!org) return res.status(400).json({ msg: "No Organization found" });

    await Org.findByIdAndUpdate(
      org._id,
      {
        $push: { admin: { $each: admins } },
      },
      { new: true, useFindAndModify: false }
    );
    success = true;
    res.status(200).json({ success, msg: "Admins added successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

router.post(
  "/add-employee",
  checkAdmin,
  [
    body("email", "Enter a valid e-mail").isEmail(),
    body("name", "Username: minimum 3 characters").isLength({ min: 3 }),
    body("password", "Password: minimum 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    try {
      let employee = await User.findOne({ email: req.body.email });
      if (employee) {
        return res.status(400).json({ error: "This email is already in use" });
      }
      const salt = await bcrypt.genSalt(10);

      secPass = await bcrypt.hash(req.body.password, salt);
      //Create User
      employee = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: "employee",
        password: secPass,
      });

      const employeeId = employee.id;

      const userId = req.user.id;
      const org = await Org.findOne({ creator: userId });
      if (!org) return res.status(400).json({ msg: "No Organization found" });

      await Org.findByIdAndUpdate(
        org._id,
        {
          $push: { employee: employeeId },
        },
        { new: true, useFindAndModify: false }
      );
      success = true;
      res.status(200).json({ success, msg: "Employee added successfully" });
    } catch (error) {
      res.status(500).json({ msg: "Internal Server Error" });
    }
  }
);

router.get("/get-org", checkAdmin, async (req, res) => {
  let success = false;
  try {
    const userId = req.user.id;
    const org = await Org.findOne({
      $or: [{ creator: userId }, { admin: userId }],
    });
    if (!org) return res.status(400).json({ msg: "No Organization found" });
    success = true;
    res.status(200).json({ success, org });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = router;
