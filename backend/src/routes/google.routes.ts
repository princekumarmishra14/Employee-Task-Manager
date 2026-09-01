/**
 * backend/src/routes/google.routes.ts
 * Express router mapping Google OAuth authentication actions.
 */

import { Router } from "express";
import { googleLogin, connectGoogle, disconnectGoogle } from "../controllers/googleAuth.controller";
import { googleVerifyMiddleware } from "../middlewares/googleVerify";
import { verifyJwt } from "../middlewares/auth.middleware";

const router = Router();

// Public login/signup route
router.post("/google", googleVerifyMiddleware, googleLogin);

// Account connection/disconnection routes
router.post("/google/connect", verifyJwt, googleVerifyMiddleware, connectGoogle);
router.post("/google/disconnect", verifyJwt, disconnectGoogle);

export default router;
