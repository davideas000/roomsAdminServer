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
    enum: ["pending", "approved", "removed"],
    required: true
  },
  userId: {type: String, required: true},
  roomId: {type: String, required: true}
  // createdAt: {type: Date, default: Date.now()}, // $$$$dddd
  // updatedAt: {type: Date, default: Date.now()} // $$$$dddd
}, {timestamps: true});

// testb
// reservationSchema.pre('save', function (done) {
//   let user = this;
//   user.updatedAt = Date.now();
//   done();
// });
// teste

reservationSchema.methods.findOverlappingReservations = function (callback: any) {
  return this.model("Reservation").find(
    {
      roomId: this.roomId,
      startDate: {$lte: this.endDate},
      endDate: {$gte: this.startDate},
      startTime: {$lt: this.endTime},
      endTime: {$gt: this.startTime}
    },
    callback
  );
}

export const ReservationModel = mongoose.model("Reservation", reservationSchema);

