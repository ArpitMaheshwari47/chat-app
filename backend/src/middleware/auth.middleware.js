import { User } from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = res.cookie.jwt;
    if (!token) {
      res.status(401).json({ message: "Unauthorized- No Token Provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SERECT);
    if (!decoded) {
      res.status(401).json({ message: "Unauthorized- Invalid Token" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "user not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("error", error);
  }
};
