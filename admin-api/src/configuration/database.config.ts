import mongoose from 'mongoose';

export const init = async (databaseUri: string) => {
    try {
        await mongoose.connect(databaseUri);

        console.log('Connected to Database.');
    } catch (err) {
        console.error('Could not connect to Database.', err);
        process.exit(1);
    }
};
