import { BadRequestError } from '@hyperflake/http-errors';

import axios from 'axios';

export default class SmsService {
    apiKey: string;

    constructor(params: { smsApiKey: any }) {
        const { smsApiKey } = params;
        this.apiKey = smsApiKey;
    }
    sendSms = async (params: { phone: string; otp: string }) => {
        const { phone, otp } = params;
        if (process.env.NODE_ENV !== 'production') {
            console.log(`Development environment detected. SMS not sent. Phone: ${phone}, OTP: ${otp}`);
            return;
        }

        const url = `https://2factor.in/API/V1/${this.apiKey}/SMS/${phone}/${otp}`;

        try {
            const response = await axios.get(url);
            if (response.data.Status !== 'Success') throw new BadRequestError('An error occurred while sending OTP');
            return;
        } catch (error) {
            throw error;
        }
    };

    public sendOtpSms = async (params: { phone: string; otp: string }) => {
        const { phone, otp } = params;

        return await this.sendSms({ phone, otp });
    };
}
