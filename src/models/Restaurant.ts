import mongoose, { Schema, Document } from "mongoose";

export interface IRestaurant extends Document {
  name: string;
  logoUrl: string;
  tagline: string;
  address: string;
  phone: string;
  whatsappNumber?: string;
  email: string;
  openingHours: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  isGstEnabled?: boolean;
  gstNumber?: string;
}

const RestaurantSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    logoUrl: { type: String },
    tagline: { type: String },
    address: { type: String },
    phone: { type: String },
    whatsappNumber: { type: String },
    email: { type: String },
    openingHours: { type: String },
    socialLinks: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String },
    },
    isGstEnabled: { type: Boolean, default: false },
    gstNumber: { type: String },
  },
  { timestamps: true },
);

RestaurantSchema.set("toJSON", {
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

export default mongoose.models.Restaurant ||
  mongoose.model<IRestaurant>("Restaurant", RestaurantSchema);
