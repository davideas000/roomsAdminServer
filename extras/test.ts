import * as mongoose from 'mongoose';
import { config } from '../config/config';
import { UserModel } from '../lib/models/user.model';

mongoose.connect(config.mongoURL, {useNewUrlParser: true});

const user = new UserModel({

  name: "david az",
  displayName: "endrew",
  email: "david.edews@gmail.com",
  password: "dddddddd",
  role: "auth",
  createdAt: new Date(),
  updatedAt: new Date()
});

user.save().then( () => console.log("user saved"));
