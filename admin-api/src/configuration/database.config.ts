import mongoose from 'mongoose';

export const init = async () => {
    mongoose.set('strictQuery', false);

    try {
        await mongoose.connect(process.env.DATABASE_URI!);

        console.log('Connected to Database.');
    } catch (err) {
        console.error('Could not connect to Database.', err);
        process.exit(1);
    }
};
