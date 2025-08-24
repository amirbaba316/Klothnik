import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IOtpVerification extends Document {
    phoneNumber: string;
    otp: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Put all instance methods in this interface
export interface IOtpVerificationMethods {
    generateOtp: () => string;

    setExpiresAt: (OTP_EXPIRATION_MINUTES: any) => void;
}

export const otpVerificationSchema = new Schema<IOtpVerification, OtpVerificationModel, IOtpVerificationMethods>(
    {
        phoneNumber: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
        },
        expiresAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: 'OtpVerification',
        toJSON: {
            getters: true,
        },
        toObject: {
            getters: true,
        },
    }
);

otpVerificationSchema.methods.generateOtp = () => {
    const length = 4;
    let otp = '';
    const characters = '0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        otp += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    // Pad the OTP with leading zeros if necessary
    otp = otp.padStart(length, '0');
    return otp;
};

otpVerificationSchema.methods.setExpiresAt = function (OTP_EXPIRATION_MINUTES) {
    const now = new Date();

    this.expiresAt = new Date(now.getTime() + OTP_EXPIRATION_MINUTES * 60000);
};

// Put all static methods in this interface
interface OtpVerificationModel extends Model<IOtpVerification, {}, IOtpVerificationMethods> {}

export const OtpVerification = mongoose.model<IOtpVerification, OtpVerificationModel>(
    'OptVerification',
    otpVerificationSchema
);
