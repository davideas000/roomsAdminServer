import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

const reservationSchema = new Schema({
  reason: String,
  startDate: {type: Date, required: true},
  endDate: {type: Date, required: true},
  startTime: {type: Date, required: true},
  endTime: {type: Date, required: true},
  code: Number,
  sequence: Number,
  status: {
    type: String,
    enum: ["pending", "aproved", "removed"],
    required: true
  },
  userId: {type: String, required: true},
  roomId: {type: String, required: true},
  createdAt: {type: Date, default: Date.now()},
  updatedAt: {type: Date, default: Date.now()}
});

reservationSchema.pre('save', function (done) {
  let user = this;
  user.updatedAt = Date.now();
  done();
});

export const ReservationModel = mongoose.model("ReservationModel", reservationSchema);

