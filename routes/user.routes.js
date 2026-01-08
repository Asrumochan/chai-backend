import { Router } from "express";
import {
  changeCurrentPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  removeUserAvatar,
  updateUserAvatar,
  getCurrentUser,
  updateAccountDetails,
  updateUserCoverImage,
  removeUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router
  .route("/update-avatar")
  .post(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/remove-avatar").post(verifyJWT, removeUserAvatar);
router
  .route("/update-cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/remove-cover-image").post(verifyJWT, removeUserCoverImage);

router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
router.route("/watch-history").get(verifyJWT, getWatchHistory);

export default router;
