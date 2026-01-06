import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/AppError.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/user.model.js";

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

  if (!avatar || !avatar.url) {
    throw new ApiError("Failed to upload avatar", 500);
  }

  //create user object and insert into db
  const user = await User.create({
    fullName,
    userName: userName.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url ?? "",
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
  const { accessToken, refreshToken } = await generateRefreshAndAccessTokens(user._id);

  //remove password and refresh token from user object
  const userLoggedIn = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: userLoggedIn, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
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
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "Logout successful"));
});

export { registerUser, loginUser, logoutUser };
