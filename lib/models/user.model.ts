import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { notificationSchema } from './notification.model';

const userSchema = new Schema({
  name: {type: String, required: true},
  displayName: String,
  email: {
    type: String,
    required: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Invalid email'
    ]
  },
  password: {type: String, required: true},
  photoURL: String,
  role: {
    type: String,
    enum: ['admin', 'auth', 'responsible'],
    required: true
  },
  notifications: [notificationSchema]
}, {timestamps: true});

const BCRYPT_SALT_ROUNDS = 12;

userSchema.pre('save', function (done) {
  let user = this;
  user.updatedAt = Date.now();
  if (!user.isModified('password')) {
    return done();
  }
  bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS)
    .then((hashedPassword) => {
      user.password = hashedPassword;
      done();
    }).catch(e => {
      console.log("error", e);
      done(e);
    });
});

userSchema.methods.checkPassword = function(guess, done) {
  bcrypt.compare(guess, this.password)
    .then((res) => done(res)).catch( e => {
      console.log("error", e);
      done(e);
    });
}


export const UserModel = mongoose.model("User", userSchema);

