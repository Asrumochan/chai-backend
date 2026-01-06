import User from "../models/user.model.js";
import ApiError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // Get token from headers
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError("No token provided", 401);
    }
    
    //extract decoded token from jwt verify
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    //extract user from db
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError("User not found / Invalid access token", 404);
    }
    req.user = user; // Attach user to request object
    next();
  } catch (error) {
    throw new ApiError(error?.message || "Unauthorized access", 401);
  }
});
