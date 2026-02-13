import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: any[];
  subtotal: number;
  discount?: number;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  couponCode?: string;
  tax: number;
  total: number;
  status: string;
  orderType: string;
  tableNumber?: string;
  notes?: string;
  createdBy: string;
  isPaid: boolean;
  isViewed: boolean;
  paymentMethod?: string;
}

const OrderSchema: Schema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerName: { type: String },
    customerPhone: { type: String },
    customerAddress: { type: String },
    items: [
      {
        dishId: { type: String, required: true },
        dishName: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number },
        dishDiscountType: { type: String },
        dishDiscountValue: { type: Number },
        isVeg: { type: Boolean },
        notes: { type: String },
        variantId: { type: String },
        variantName: { type: String },
        selectedCustomizations: [
          {
            groupId: { type: String },
            groupName: { type: String },
            optionId: { type: String },
            optionName: { type: String },
            price: { type: Number },
          },
        ],
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    discountType: { type: String, enum: ["percentage", "fixed", null] },
    discountValue: { type: Number },
    couponCode: { type: String },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "completed", "cancelled"],
      default: "pending",
    },
    orderType: {
      type: String,
      enum: ["dine-in", "takeaway", "delivery"],
      required: true,
    },
    tableNumber: { type: String },
    notes: { type: String },
    createdBy: { type: String, required: true },
    isPaid: { type: Boolean, default: false },
    isViewed: { type: Boolean, default: false },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "online", null],
    },
  },
  { timestamps: true },
);

OrderSchema.set("toJSON", {
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    // Map timestamps to Date objects to match Firestore toDate() behavior if needed,
    // but Next.js serialization will handle them as strings/ISO dates.
  },
});

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
