import { Schema, model } from 'mongoose';

const roomSchema = new Schema({
  name: {type: String, required: true},
  description: String,
  width: {type: Number, required: true},
  length: {type: Number, required: true},
  capacity: {type: Number, required: true},
  location: {
    type: {type: String, default: "Point"},
    coordinates: {type: [], default: [0, 0]}
  },
  type: {type: String, required: true},
  department: {type: Schema.Types.Object, ref: "Department", required: true},
  photos: [String]
}, {timestamps: true});

export const RoomModel = model("Room", roomSchema);
