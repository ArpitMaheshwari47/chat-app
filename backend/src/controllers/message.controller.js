import cloudinary from "../lib/cloudinary.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

export const getUserForSideBar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// get messages between two user
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { receiverId: myId, senderId: userToChatId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;

    const senderId = req.user;
    let imageUrl;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;

      const newMessages = new Message({
        senderId,
        receiverId,
        text,
        image: imageUrl,
      });

      await newMessages.save();

      //   todo : realTime functionality goes here = > socket.id

      res.status(201).json(newMessages)
    }
  } catch (error) {
    console.log("Error in sendMessage controller", error.message);
    res.status(500).json({error:"Internal Server Error"})
  }
};
