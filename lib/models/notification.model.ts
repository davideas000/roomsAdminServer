import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  message: {type: String, required: true},
  status:  {
    type: String,
    enum: ["read", "unread"],
    required: true
  }
}, {timestamps: true});

export const NotificationModel = mongoose.model("Notification", notificationSchema);
