import { BadRequestError } from '@hyperflake/http-errors';
import { smsService } from '@klothnick/shared/utils';
import { OtpVerification, User } from '@klothnick/shared/models';
import { UserStatusEnum } from '@klothnick/shared/enums';

const OTP_EXPIRATION_MINUTES = parseInt(process.env.OTP_EXPIRATION_MINUTES || '10', 10);

type CreateOtpInput = { phone: string };
type VerifyOtpInput = { phone: string; otp: string };

export default class AuthService {
    async createOtpVerification({ phone }: CreateOtpInput) {
        if (phone === process.env.TEST_ACCOUNT_PHONE_NUMBER) return;

        let otpVerification = await OtpVerification.findOne({ phone });

        console.log('Here');

        if (!otpVerification) {
            otpVerification = await OtpVerification.create({ phone });
        }

        otpVerification.otp = otpVerification.generateOtp();
        otpVerification.setExpiresAt(OTP_EXPIRATION_MINUTES);

        await otpVerification.save();

        await smsService.sendSms({ phone: phone, otp: otpVerification.otp });

        return { otp: otpVerification.otp };
    }

    async verifyOtp({ phone, otp }: VerifyOtpInput) {
        let otpVerification = await OtpVerification.findOne({ phone });

        if (phone === process.env.TEST_ACCOUNT_PHONE_NUMBER) {
            otpVerification = {
                phone,
                otp: process.env.TEST_ACCOUNT_OTP,
                expiresAt: new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60_000),
            } as any;
        }

        if (!otpVerification) throw new BadRequestError(`Invalid phone number.`);
        if (otp !== otpVerification.otp) throw new BadRequestError(`Invalid OTP.`);
        if (new Date() > new Date(otpVerification.expiresAt)) {
            throw new BadRequestError(`OTP expired.`);
        }

        let user = await User.findOne({ phone: phone });
        if (!user) {
            user = await User.create({ phone: phone });
        } else if (user.status === UserStatusEnum.DELETED) {
            user.status = UserStatusEnum.ENABLED;
        }

        await user.save();

        const token = await user.generateAuthToken();
        return { token, user };
    }
}
