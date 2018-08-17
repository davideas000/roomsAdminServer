import * as mongoose from 'mongoose';
import { config } from '../config/config';
import { User } from '../lib/models/user.model';

mongoose.connect(config.mongoUrl, {useNewUrlParser: true});

const user = new User({

  name: "david az",
  displayName: "endrew",
  email: "david.edews@gmail.com",
  password: "dddddddd",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
});

user.save().then( () => console.log("user saved"));
