// src/controllers/eventController.js
import User from "../model/userSchema.js";

export const addEvent = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming you have a middleware to attach user details to the request
    const {
      eventName,
      participants,
      startDate,
      endDate,
      allDay,
      location,
      repeat,
    } = req.body;

    // Find the organizer by userId
    const organizer = await User.findOne({ userId });

    if (!organizer || organizer.userRole !== "organizer") {
      return res
        .status(403)
        .json({ error: "Permission denied. Only organizers can add events." });
    }

    // Create a new event
    const newEvent = {
      eventName,
      participants,
      startDate,
      endDate,
      allDay,
      location,
      repeat,
    };

    // Add the event to the organizer's events array
    organizer.events.push(newEvent);

    // Save the organizer document with the updated events array
    await organizer.save();

    // Share the event details with selected participants
    await Promise.all(
      participants.map(async (participantId) => {
        const participant = await User.findById(participantId);
        if (participant) {
          participant.events.push(newEvent);
          await participant.save();
        }
      })
    );

    res
      .status(201)
      .json({ message: "Event added successfully", event: newEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
