import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import * as bcrypt from 'bcrypt';

const userSchema = new Schema({
  name: {type: String, require: true},
  displayName: String,
  email: {type: String, require: true},
  password: {type: String, require: true},
  photoURL: String,
  role: {type: String, require: true},
  createdAt: {type: Date, require: true},
  updatedAt: {type: Date, require: true}
});

const BCRYPT_SALT_ROUNDS = 12;

userSchema.pre('save', function (done) {
  let user = this;
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
  // console.log("dddddddddddddguess", guess, this); // $$$$dddd
  bcrypt.compare(guess, this.password)
    .then((res) => done(res)).catch( e => {
      console.log("error", e);
      done(e);
    });
}


export const User = mongoose.model("User", userSchema);

