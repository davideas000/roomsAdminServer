import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

const userSchema = new Schema({
  name: {type: String, require: true},
  displayName: String,
  email: {type: String, require: true},
  photoURL: String,
  role: {type: String, require: true},
  createdAt: {type: Date, require: true},
  updatedAt: {type: Date, require: true}
});

export const User = mongoose.model("User", userSchema);

