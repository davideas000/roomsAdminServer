import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

export const notificationSchema = new Schema({
  message: {type: String, required: true},
  status:  {
    type: String,
    enum: ["read", "unread"],
    required: true
  }
}, {timestamps: true});

