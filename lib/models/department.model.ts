import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

const departmentSchema = new Schema({
  name: String,
  acronym: {type: String, required: true},
  userId: {type: String, required: true},
}, {timestamps: true});

export const DepartmentModel = mongoose.model("Department", departmentSchema);

