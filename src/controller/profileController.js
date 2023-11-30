// src/controllers/profileController.js
import User from "../model/userSchema.js";

export const addProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    const userProfileData = req.body;

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.profile = userProfileData;

    await user.save();

    res.status(200).json({
      message: "Profile added successfully",
      userProfile: user.profile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
