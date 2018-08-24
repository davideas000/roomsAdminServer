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
  departmentId: {type: String, required: true},
  // createdAt: {type: Date, default: new Date()}, // $$$$dddd
  // updatedAt: {type: Date, default: new Date()}  // $$$$dddd
}, {timestamps: true});

export const RoomModel = model("Room", roomSchema);
