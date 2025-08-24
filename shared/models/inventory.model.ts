import { Schema, model, Model, Types } from 'mongoose';
import { InventoryAdjustmentTypeEnum } from '../enums/inventory-adjustment-type.enum';

export interface IInventoryItem {
    _id: Types.ObjectId;
    product: Types.ObjectId; // Reference to Product
    variant?: Types.ObjectId; // Reference to ProductVariant (if applicable)
    sku: string; // Unique stock keeping unit
    quantity: number; // Current available stock
    lowStockThreshold: number; // Alert when stock <= this value
    location?: string; // Warehouse/bin location
    lastUpdated: Date;
}

export interface IInventoryAdjustment {
    _id: Types.ObjectId;
    item: Types.ObjectId; // Reference to InventoryItem
    type: InventoryAdjustmentTypeEnum;
    quantity: number; // Positive (add) or negative (deduct)
    reference?: {
        // Links to related documents
        order?: Types.ObjectId; // For sales/returns
        purchaseOrder?: Types.ObjectId; // For supplier purchases
        userId?: Types.ObjectId; // Who performed the adjustment
    };
    notes?: string;
    date: Date;
}

export interface IInventoryMethods {}

export interface InventoryModel extends Model<IInventoryItem, {}, IInventoryMethods> {}

// Inventory Item Schema (Tracks current stock levels)
export const InventoryItemSchema = new Schema<IInventoryItem, InventoryModel, IInventoryMethods>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        variant: {
            type: Schema.Types.ObjectId,
            ref: 'ProductVariant',
        },
        sku: {
            type: String,
            required: true,
            unique: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        lowStockThreshold: {
            type: Number,
            default: 5, // Warn when stock ≤ 5
        },
        location: {
            type: String,
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: 'InventoryItem',
    }
);

// Inventory Adjustment Schema (Audit log for stock changes)
export const InventoryAdjustmentSchema = new Schema<IInventoryAdjustment>(
    {
        item: {
            type: Schema.Types.ObjectId,
            ref: 'InventoryItem',
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(InventoryAdjustmentTypeEnum),
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        reference: {
            order: { type: Schema.Types.ObjectId, ref: 'Order' },
            purchaseOrder: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
            userId: { type: Schema.Types.ObjectId, ref: 'User' },
        },
        notes: {
            type: String,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: 'InventoryAdjustment',
    }
);

// Indexes for performance
InventoryItemSchema.index({ product: 1, variant: 1 }, { unique: true });
InventoryItemSchema.index({ sku: 1 }, { unique: true });
InventoryAdjustmentSchema.index({ item: 1 });
InventoryAdjustmentSchema.index({ 'reference.order': 1 });

// Pre-save hook to update lastUpdated timestamp
InventoryItemSchema.pre('save', function (next) {
    this.lastUpdated = new Date();
    next();
});

export const InventoryItem = model<IInventoryItem, InventoryModel>('InventoryItem', InventoryItemSchema);
export const InventoryAdjustment = model<IInventoryAdjustment>('InventoryAdjustment', InventoryAdjustmentSchema);
