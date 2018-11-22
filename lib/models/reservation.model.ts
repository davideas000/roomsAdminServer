import { Schema, model, Types } from 'mongoose';
import { RoomModel } from './room.model';

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

reservationSchema.query.countByStatusAndDep = function(status, dep) {
  console.error("bydep and status", dep, status);
  return RoomModel.aggregate([
    {$match: {department: Types.ObjectId(dep)}},
    {$project: {_id: 1}},
    {$lookup: {
      from: 'reservations',
      let: {pid: "$_id"},
      pipeline: [{
        $match: {
          $expr: {
            $and: [
              {$eq: ["$room", "$$pid"]},
              {$eq: ["$status", status]}
            ]
          }
        }
      }],
      as: 'reservations'
    }},
    {$project: {reservations: 1}},
    {$unwind: '$reservations'},
    {$replaceRoot: {newRoot: '$reservations'}},
    {$count: 'n'}
  ]);
}

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

