import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import * as bcrypt from 'bcrypt';

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
  photoURL: {
    type: String,
    match: [
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/,
      'Invalid url'
    ]
  },
  role: {
    type: String,
    enum: ['admin', 'auth', 'responsible'],
    required: true
  },
  createdAt: {type: Date, default: Date.now()},
  updatedAt: {type: Date, default: Date.now()}
});

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


export default mongoose.model("User", userSchema);

