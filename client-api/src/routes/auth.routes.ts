import { Request, Response, Router } from 'express';
import { authService } from '../services';

const router = Router({ mergeParams: true });

/**
 * @method POST
 * @desc Send OTP
 */
router.post('/otp', async (req: Request, res: Response) => {
    const { phoneNumber } = req.body;
    await authService.createOtpVerification({ phoneNumber });
    res.send({ success: true });
});

/**
 * @method POST
 * @desc Verify OTP & login
 */
router.post('/otp/verify', async (req: Request, res: Response) => {
    const { phoneNumber, otp } = req.body;
    const result = await authService.verifyOtp({ phoneNumber, otp });
    res.send(result);
});

export default router;
