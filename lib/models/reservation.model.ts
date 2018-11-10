import { Schema, model } from 'mongoose';

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
  user: {type: Schema.Types.ObjectId, ref: "User", required: true},
  room: {type: Schema.Types.ObjectId, ref: "Room", required: true}
}, {timestamps: true});

reservationSchema.methods.findOverlappingReservations = function (callback) {
  const query: any =  {
    startDate: {$lte: this.endDate},
    endDate: {$gte: this.startDate},
    startTime: {$lt: this.endTime},
    endTime: {$gt: this.startTime},
    status: {$ne: "removed"}
  };

  if (this.room) {
    query.room = this.room;
  }
  
  return this.model("Reservation").find(
    query,
    callback
  );
}

export const ReservationModel = model("Reservation", reservationSchema);

