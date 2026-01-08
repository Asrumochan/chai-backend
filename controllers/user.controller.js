import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/AppError.js";
import User from "../models/user.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import { OPTIONS } from "../src/const.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateRefreshAndAccessTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("generateRefreshAndAccessTokens error:", error);
    throw new ApiError("Error generating tokens", 500);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //collect data from frontend
  const { fullName, userName, email, password } = req.body || {};

  //   validation for non empty fields
  if (
    [fullName, password, userName, email].some((field) => field.trim() === "")
  ) {
    throw new ApiError("All fields are required", 400);
  }

  // validation for existing user
  const isExistedUser = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (isExistedUser) {
    throw new ApiError(
      `User with email: ${email} or username: ${userName}  already exists`,
      409
    );
  }
  console.log(req.files);
  //check for images
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  //check for avatar is present or not
  if (!avatarLocalPath) {
    throw new ApiError("Avatar is required", 400);
  }

  //   upload images to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar || !avatar.url) {
    throw new ApiError("Failed to upload avatar", 500);
  }

  //create user object and insert into db
  const user = await User.create({
    fullName,
    userName: userName.toLowerCase(),
    email,
    password,
    avatar: {
      url: avatar.url,
      public_id: avatar.public_id,
    },
    coverImage: {
      url: coverImage.url || "",
      public_id: coverImage.public_id || "",
    },
  });

  //CHECK FOR user creation and remove password and refresh token
  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!userCreated) {
    throw new ApiError("Something went wrong while registering the user", 500);
  }

  return res
    .status(201)
    .json(new ApiResponse(200, userCreated, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //collect data from req
  const { userName, email, password } = req.body;
  //validation for non empty fields
  if (!userName && !email) {
    throw new ApiError("All fields are required", 400);
  }

  //check for existing user
  const user = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (!user) {
    throw new ApiError("User does not exist", 401);
  }

  //check for password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError("Invalid credentials", 401);
  }

  //generate tokens
  const { accessToken, refreshToken } = await generateRefreshAndAccessTokens(
    user._id
  );

  //remove password and refresh token from user object
  const userLoggedIn = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, OPTIONS)
    .cookie("accessToken", accessToken, OPTIONS)
    .json(
      new ApiResponse(
        200,
        {
          user: userLoggedIn,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  //find user by id
  const userId = req.user._id;

  await User.findByIdAndUpdate(
    userId,
    {
      $set: { refreshToken: null },
    },
    { new: true }
  );

  //clear cookies
  return res
    .status(200)
    .clearCookie("refreshToken", OPTIONS)
    .clearCookie("accessToken", OPTIONS)
    .json(new ApiResponse(200, {}, "Logout successful"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  //collect the refresh token from  cookies
  //decode the token using jwt
  //from the decoded token's id collect user from db
  //generate new tokens
  //save the new token into database

  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError("Unauthorized request", 401);
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodedToken) {
      throw new ApiError("Token Invalid", 401);
    }

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError("user not found for this token", 401);
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError("Refresh token is expired or used", 401);
    }

    const { accessToken, newRefreshToken } =
      await generateRefreshAndAccessTokens(user._id);

    return res
      .status(200)
      .cookie("refreshToken", newRefreshToken, OPTIONS)
      .cookie("accessToken", accessToken, OPTIONS)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed !!"
        )
      );
  } catch (error) {
    throw new ApiError(error?.message || "Invalid refresh token", 401);
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  //collect old and new password from req.body
  //collect user data from user middleware
  //check for old password in DB
  //update the user data with new password
  //update DB and return json response
  console.log(req.body, req.user);
  const { oldPassword, newPassword } = req.body || {};
  console.log(oldPassword, newPassword);
  if (!oldPassword || !newPassword) {
    throw new ApiError("All fields are required", 400);
  }

  const user = await User.findById(req?.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError("Old password is not correct !", 401);
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  /*
    1.Updates the user's account details by performing the following steps:
    2.Collects the input data from the request body (req.body).
    3.Retrieves the existing user data from the database using the req.user middleware.
    4.Modifies the user data with the new account details provided.
    5.Returns the updated user information as the response. */

  const { fullName, email } = req.body || {};

  if (!fullName || !email) {
    throw new ApiError("Please enter the required details", 401);
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { fullName, email: email },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details saved"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError("Error while uploading in cloudinary");
  }

  if (req.user?.avatar.public_id) {
    await deleteFromCloudinary(req.user.avatar.public_id);
  }

  let avatarObj = {
    url: avatar.url,
    public_id: avatar.public_id,
  };

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatarObj },
    },
    { new: true }
  ).select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const removeUserAvatar = asyncHandler(async (req, res) => {
  if (!req.user?.avatar.public_id) {
    // nothing to remove
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "No avatar to remove"));
  }
  console.log(req.user.avatar);
  const deleteResult = await deleteFromCloudinary(req.user?.avatar.public_id);

  if (!deleteResult) {
    throw new ApiError("Unable to delete the current avatar", 500);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { avatar: { url: "", public_id: "" } } },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar removed successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError("Error while uploading in cloudinary");
  }

  let coverImageObj = {
    url: coverImage.url,
    public_id: coverImage.public_id,
  };
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { coverImage: coverImageObj },
    },
    { new: true }
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, user, "CoverImage updated successfully"));
});

const removeUserCoverImage = asyncHandler(async (req, res) => {
  if (!req.user?.coverImage.public_id) {
    // nothing to remove
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "No avatar to remove"));
  }

  const deleteResult = await deleteFromCloudinary(
    req.user?.coverImage.public_id
  );

  if (!deleteResult) {
    throw new ApiError("Unable to delete coverImage");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { coverImage: { url: "", public_id: "" } } },
    { new: true }
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, user, "Successfully deleted coverImage"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    throw new ApiError("username is missing !!", username);
  }
  const channel = await User.aggregate([
    {
      $match: { userName: username?.toLowerCase() },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  console.log(channel);
  if (!channel?.length) {
    throw new ApiError("Channel does not exists", 404);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully !")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    userName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  console.log(user);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history collected successfully"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  removeUserAvatar,
  removeUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
