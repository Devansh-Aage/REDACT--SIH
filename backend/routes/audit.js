const contract = require("../blockchain");
const fetchuser = require("../middleware/fetchuser");
const express = require("express");
const File = require("../models/File");
const checkAdmin = require("../middleware/checkAdmin");

const router = express.Router();

router.post("/addaudit", fetchuser, async (req, res) => {
  try {
    let success = false;
    const { cid, eventType,filename } = req.body;
    const userID = req.user.id;
    const tx = await contract.recordEvent(userID, cid,filename, eventType);
    await tx.wait(); // Wait for the transaction to be confirmed
    console.log("Event recorded successfully.");
    success = true;
    res.json(success);
  } catch (error) {
    res.status(500).send({ msg: "Something went wrong", error: error });
  }
});

router.get("/getuseraudits", fetchuser, async (req, res) => {
  try {
    let success = false;
    const userId = req.user.id;
    const events = await contract.getEventsByUserID(userId);

    const formattedEvents = events.map((event) => ({
      userID: event.userID,
      timestamp: Number(event.timestamp), // Convert BigInt to Number
      cid: event.cid,
      eventType: Number(event.eventType), // Convert enum to Number if necessary
      filename:event.filename
    }));

    const updatedEventsPromises = formattedEvents.map(async (event) => {
      try {
        const file = await File.findOne({ ipfsCID: event?.cid }).exec();
        return {
          ...event,
          filename: file ? file?.filename : event?.filename, // Add filename, default to "Unknown" if not found
        };
      } catch (fileError) {
        console.error(`Error fetching file for CID ${event?.cid}:`, fileError);
        return {
          ...event,
          filename: "Error retrieving filename", // Handle error case
        };
      }
    });

    const updatedEvents = await Promise.all(updatedEventsPromises);

    success = true;
    res.json({ success, updatedEvents });
  } catch (error) {
    console.error("Error fetching user audits:", error);
    res.status(500).json({ error: "An error occurred while fetching audits." });
  }
});

router.get("/get-employee-audits", checkAdmin, async (req, res) => {
  try {
    let success = false;
    const { userId } = req.body;
    const events = await contract.getEventsByUserID(userId);

    const formattedEvents = events.map((event) => ({
      userID: event.userID,
      timestamp: Number(event.timestamp), // Convert BigInt to Number
      cid: event.cid,
      eventType: Number(event.eventType), // Convert enum to Number if necessary
    }));

    const updatedEventsPromises = formattedEvents.map(async (event) => {
      try {
        const file = await File.findOne({ ipfsCID: event?.cid }).exec();
        return {
          ...event,
          filename: file ? file?.filename : "Unknown", // Add filename, default to "Unknown" if not found
        };
      } catch (fileError) {
        console.error(`Error fetching file for CID ${event?.cid}:`, fileError);
        return {
          ...event,
          filename: "Error retrieving filename", // Handle error case
        };
      }
    });

    const updatedEvents = await Promise.all(updatedEventsPromises);

    success = true;
    res.json({ success, updatedEvents });
  } catch (error) {
    console.error("Error fetching user audits:", error);
    res.status(500).json({ error: "An error occurred while fetching audits." });
  }
});

module.exports = router;
