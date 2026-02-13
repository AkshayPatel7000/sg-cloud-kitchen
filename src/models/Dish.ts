import mongoose, { Schema, Document } from "mongoose";

export interface IDish extends Document {
  name: string;
  categoryId: mongoose.Types.ObjectId;
  description: string;
  price: number;
  imageUrl: string;
  isVeg: boolean;
  isAvailable: boolean;
  tags: string[];
  variants?: {
    id: string;
    name: string;
    price: number;
  }[];
  customizations?: {
    id: string;
    name: string;
    minSelection: number;
    maxSelection: number;
    options: {
      id: string;
      name: string;
      price: number;
    }[];
  }[];
  discountType?: "percentage" | "fixed" | "none";
  discountValue?: number;
}

const DishSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: { type: String },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    isVeg: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    tags: [{ type: String }],
    variants: [
      {
        id: { type: String },
        name: { type: String },
        price: { type: Number },
      },
    ],
    customizations: [
      {
        id: { type: String },
        name: { type: String },
        minSelection: { type: Number },
        maxSelection: { type: Number },
        options: [
          {
            id: { type: String },
            name: { type: String },
            price: { type: Number },
          },
        ],
      },
    ],
    discountType: {
      type: String,
      enum: ["percentage", "fixed", "none"],
      default: "none",
    },
    discountValue: { type: Number, default: 0 },
  },
  { timestamps: true },
);

DishSchema.set("toJSON", {
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    ret.categoryId = ret.categoryId.toString();
    delete ret._id;
    delete ret.__v;
  },
});

export default mongoose.models.Dish ||
  mongoose.model<IDish>("Dish", DishSchema);
