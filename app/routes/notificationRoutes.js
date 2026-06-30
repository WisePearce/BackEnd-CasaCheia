import { Router } from "express";
import authenticateTokenProfile from "../middlewares/authProfileMiddleware.js";
import { getUserNotifications, markNotificationAsRead } from "../controllers/notificationController.js";

const router = Router();

router.get("/profile/notifications", authenticateTokenProfile, getUserNotifications);
router.patch("/profile/notifications/:id/read", authenticateTokenProfile, markNotificationAsRead);

export default router;
