import SmsService from './sms.utils';

const smsApiKey = process.env.TWOFACTORSMSAPIKEY as any;

export const smsService = new SmsService({ smsApiKey });
