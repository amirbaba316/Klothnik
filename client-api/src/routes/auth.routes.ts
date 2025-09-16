import { Request, Response, Router } from 'express';
import { authService } from '../services';

const router = Router({ mergeParams: true });

/**
 * @method POST
 * @desc Send OTP
 */
router.post('/otp', async (req: Request, res: Response) => {
    const { phone } = req.body;

    console.log(phone);
    const otp = await authService.createOtpVerification({ phone });
    res.send(otp);
});

/**
 * @method POST
 * @desc Verify OTP & login.
 */
router.post('/otp/verify', async (req: Request, res: Response) => {
    const { phone, otp } = req.body;
    const result = await authService.verifyOtp({ phone, otp });
    res.send(result);
});

export default router;
