import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/AppError.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //collect data from frontend
  const { fullName, userName, email, password } = req.body;

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

  if (!avatar) {
    throw new ApiError("Avatar file is required", 400);
  }

  //create user object and insert into db
  const user = await User.create({
    fullName,
    userName: userName.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage.url ?? "",
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
    .json(ApiResponse(200, userCreated, "User registered successfully"));
});

export { registerUser };
