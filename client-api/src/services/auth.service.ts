import { BadRequestError } from '@hyperflake/http-errors';
import { IUser, User } from '@klothnick/shared/models/user.model';
import { smsService } from '@klothnick/shared/utils';
import { OtpVerification } from '@klothnick/shared/models';
import { UserStatusEnum } from '@klothnick/shared/enums';

const OTP_EXPIRATION_MINUTES = parseInt(process.env.OTP_EXPIRATION_MINUTES || '10', 10);

type CreateOtpInput = { phoneNumber: string };
type VerifyOtpInput = { phoneNumber: string; otp: string };

export default class AuthService {
    async createOtpVerification({ phoneNumber }: CreateOtpInput) {
        if (phoneNumber === process.env.TEST_ACCOUNT_PHONE_NUMBER) return;

        let otpVerification = await OtpVerification.findOne({ phoneNumber });

        if (!otpVerification) {
            otpVerification = await OtpVerification.create({ phoneNumber });
        }

        otpVerification.otp = otpVerification.generateOtp();
        otpVerification.setExpiresAt(OTP_EXPIRATION_MINUTES);

        await otpVerification.save();

        await smsService.sendSms({ phone: phoneNumber, otp: otpVerification.otp });
    }

    async verifyOtp({ phoneNumber, otp }: VerifyOtpInput) {
        let otpVerification = await OtpVerification.findOne({ phoneNumber });

        if (phoneNumber === process.env.TEST_ACCOUNT_PHONE_NUMBER) {
            otpVerification = {
                phoneNumber,
                otp: process.env.TEST_ACCOUNT_OTP,
                expiresAt: new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60_000),
            } as any;
        }

        if (!otpVerification) throw new BadRequestError(`Invalid phone number.`);
        if (otp !== otpVerification.otp) throw new BadRequestError(`Invalid OTP.`);
        if (new Date() > new Date(otpVerification.expiresAt)) {
            throw new BadRequestError(`OTP expired.`);
        }

        let user = await User.findOne({ phoneNumber });
        if (!user) {
            user = await User.create({ phoneNumber });
        } else if (user.status === UserStatusEnum.DELETED) {
            user.status = UserStatusEnum.ENABLED;
        }

        await user.save();

        const token = await user.generateAuthToken();
        return { token, user };
    }
}
