import { Schema, model } from 'mongoose';

const departmentSchema = new Schema({
  name: String,
  acronym: {type: String, required: true},
  user: {type: Schema.Types.ObjectId, required: true},
}, {timestamps: true});

export const DepartmentModel = model("Department", departmentSchema);

