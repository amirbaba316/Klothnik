import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IOtpVerification extends Document {
    phone: string;
    otp: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Instance methods
export interface IOtpVerificationMethods {
    generateOtp(): string;
    setExpiresAt(OTP_EXPIRATION_MINUTES: number): void;
}

// Document type = schema fields + methods
export type OtpVerificationDocument = IOtpVerification & IOtpVerificationMethods;

// Static model type
export interface OtpVerificationModel extends Model<OtpVerificationDocument> {}

export const otpVerificationSchema = new Schema<OtpVerificationDocument, OtpVerificationModel>(
    {
        phone: { type: String, required: true },
        otp: { type: String },
        expiresAt: { type: Date },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: 'OtpVerification',
    }
);

otpVerificationSchema.methods.generateOtp = function () {
    const length = 4;
    let otp = '';
    const characters = '0123456789';

    for (let i = 0; i < length; i++) {
        otp += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return otp.padStart(length, '0');
};

otpVerificationSchema.methods.setExpiresAt = function (OTP_EXPIRATION_MINUTES: number) {
    const now = new Date();
    this.expiresAt = new Date(now.getTime() + OTP_EXPIRATION_MINUTES * 60000);
};

export const OtpVerification = mongoose.model<OtpVerificationDocument, OtpVerificationModel>(
    'OtpVerification',
    otpVerificationSchema
);
