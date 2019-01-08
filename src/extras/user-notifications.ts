import * as mongoose from 'mongoose';
import { config } from '../config/config';
import { UserModel } from '../models/user.model';
import { notificationSchema } from '../models/notification.model';

const con = mongoose.connect(config.mongoURL, {useNewUrlParser: true});

mongoose.connection.dropDatabase();

const fakeNotifications = [
  {
    message: "reservation at space blablabla approved",
    status: "unread"
  },
  {
    message: "reservation at space blublublu removed",
    status: "unread"
  }
];

const serverUrl = 'https://ra-server.herokuapp.com';
const localUrl = 'http://localhost:3000';

const user = new UserModel({
  name: "normal user",
  displayName: "nuser",
  email: "normal@email.com",
  password: "dddddddd",
  role: "auth",
  photoURL: process.env.MONGODB_URI ? `${serverUrl}/user-1.png` : `${localUrl}/user-1.png`
});

user.notifications.push(fakeNotifications[0]);
user.notifications.push(fakeNotifications[1]);

user.save().then( () => console.log("user saved"));

// fake user of type responsible
const resp1 = new UserModel({
  name: "responsible user",
  displayName: "ruser",
  email: "resp@email.com",
  password: "kkkkkkkk",
  role: "responsible",
});

resp1.save().then( () => console.log("user saved"));

// fake user of type responsible 2
const resp2 = new UserModel({
  name: "resp 2",
  displayName: "ruser2",
  email: "resp2@email.com",
  password: "gggggggg",
  role: "responsible",
});

resp2.save().then( () => console.log("user saved"));
