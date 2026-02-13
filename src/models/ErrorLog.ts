import mongoose, { Schema, Document } from "mongoose";

export interface IErrorLog extends Document {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  userId?: string;
  additionalInfo?: any;
}

const ErrorLogSchema: Schema = new Schema(
  {
    message: { type: String, required: true },
    stack: { type: String },
    url: { type: String },
    userAgent: { type: String },
    userId: { type: String },
    additionalInfo: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

ErrorLogSchema.set("toJSON", {
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

export default mongoose.models.ErrorLog ||
  mongoose.model<IErrorLog>("ErrorLog", ErrorLogSchema);
