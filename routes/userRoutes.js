import express from 'express';
import { createUser, loginUser, loginWithGoogle } from '../controllers/userController.js';
import { sendOTP } from '../controllers/userController.js'; // Assuming you have an otpController for sending OTPs
import { resetPassword } from '../controllers/userController.js'; // Assuming you have a resetPassword function
const userRouter = express.Router();

userRouter.post('/', createUser);
userRouter.post('/login', loginUser);
userRouter.post('/login/google', loginWithGoogle);
userRouter.post('/send-otp', sendOTP);
userRouter.post('/reset-password', resetPassword);


export default userRouter;