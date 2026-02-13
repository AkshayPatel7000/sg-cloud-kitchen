import mongoose, { Schema, Document } from "mongoose";

export interface ISectionItem extends Document {
  sectionType: string;
  title: string;
  description: string;
  imageUrl: string;
  price?: number;
  isActive: boolean;
  priority: number;
  couponCode?: string;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
}

const SectionItemSchema: Schema = new Schema(
  {
    sectionType: {
      type: String,
      enum: ["offers", "todaysSpecial", "whatsNew"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    price: { type: Number },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    couponCode: { type: String },
    discountType: { type: String, enum: ["percentage", "fixed", null] },
    discountValue: { type: Number },
  },
  { timestamps: true },
);

SectionItemSchema.set("toJSON", {
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

export default mongoose.models.SectionItem ||
  mongoose.model<ISectionItem>("SectionItem", SectionItemSchema);
