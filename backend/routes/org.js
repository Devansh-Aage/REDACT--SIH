const express = require("express");
const Org = require("../models/Org");
const checkAdmin = require("../middleware/chechAdmin");

const router = express.Router();

router.post("/add-org", checkAdmin, async (req, res) => {
  let success = false;
  try {
    const { name, creatorId } = req.body;
    if (!name || !creatorId)
      return res.status(400).json({ msg: "Please fill all the fields" });

    const org = await Org.create({
      creator: creatorId,
      name: name,
      admin: [creatorId]
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

router.post("/add-employees", checkAdmin, async (req, res) => {
  let success = false;
  try {
    const { employees } = req.body;
    const userId = req.user.id;
    const org = await Org.findOne({ creator: userId });
    if (!org) return res.status(400).json({ msg: "No Organization found" });

    await Org.findByIdAndUpdate(
      org._id,
      {
        $push: { employee: { $each: employees } },
      },
      { new: true, useFindAndModify: false }
    );
    success = true;
    res.status(200).json({ success, msg: "Admins added successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

router.get("/get-org", checkAdmin, async (req, res) => {
  let success = false;
  try {
    const userId = req.user.id;
    const org = await Org.findOne({
      $or: [{ creator: userId }, { admin: userId }],
    });
    if (!org) return res.status(400).json({ msg: "No Organization found" });
    success=true;
    res.status(200).json({ success, org });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = router;
