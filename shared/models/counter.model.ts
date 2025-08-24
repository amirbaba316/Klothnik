import { HydratedDocument, model, Model, Schema } from 'mongoose';

// Create interface representing a document
export interface ICounter {
    name: string;
    sequence: number;
}

// Put all instance methods in this interface
export interface ICounterMethods {}

// Put all static methods in this interface
export interface CounterModel extends Model<ICounter, {}, ICounterMethods> {
    getNextIdFor: (name: string) => Promise<string>;
}

export type CounterDocument = HydratedDocument<ICounter, ICounterMethods>;

// Create Schema corresponding to the document interface
export const CounterSchema = new Schema<ICounter, CounterModel, ICounterMethods>(
    {
        name: {
            type: String,
            required: true,
        },
        sequence: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        minimize: false,
        collection: 'Counter',
    }
);

// statics
CounterSchema.statics.getNextIdFor = async function (name: string) {
    const counter = await Counter.findOneAndUpdate(
        {
            name: name,
        },
        { $inc: { sequence: 1 } },
        { upsert: true, new: true }
    );

    return counter.sequence;
};

// Create a Model
export const Counter = model<ICounter, CounterModel>('Counter', CounterSchema);
