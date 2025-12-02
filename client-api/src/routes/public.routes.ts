import express from 'express';
import auth from '../middlewares/auth';

const router = express.Router();

const PRIVACY_POLICY = `Privacy Policy

At KlothNick, your privacy and trust are very important to us. We are committed to protecting your personal information and ensuring a safe and reliable shopping experience. This Privacy Policy explains what information we collect, how we use it, and how we keep it secure. By using our app, you agree to the practices described below.

Information We Collect:

Name

Phone Number

Email Address

Shipping Address

Payment Information (UPI/Card details processed securely)

Order History and Preferences

Device Details (app version, device type, IP address)

We collect this information to provide, improve, and secure your shopping experience. We do not share your personal information with any third party.

Contact Us:
If you have any questions or concerns regarding this Privacy Policy, you can reach us at:
Email: support@klothnick.com

Customer Care: +91 XXXXX XXXXX`;

/**
 *  @method GET
 *  @desc   Get all privacy policy
 *  @access Private
 */
router.get('/privacy-policy', [auth], async (req: any, res: any) => {
    const privacyPolicy = PRIVACY_POLICY;
    res.send({ content: privacyPolicy });
});

export default router;
