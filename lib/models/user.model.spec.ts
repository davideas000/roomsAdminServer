import * as mongoose from "mongoose";
import * as bcrypt from 'bcrypt';

import { UserModel } from "./user.model";

describe("user", () => {
  
  it("should not be possible to create a empty user", async () => {
    const user = new UserModel();
    const e = user.validateSync();

    expect(e.errors.name).toBeTruthy();
    expect(e.errors.name.kind).toBe("required");
    expect(e.errors.email).toBeTruthy();
    expect(e.errors.password).toBeTruthy();
    expect(e).toBeTruthy();
  });

  it("#role should be 'auth', 'admin' or 'responsible'", async () => {
    const temp = {
      name: "david endrew",
      email: "david@eamil.com",
      password: "dddddd",
      role: "dddd"
    };
    
    let user = new UserModel(temp);
    let e = user.validateSync();
    expect(e.message).toBe("User validation failed: role: `dddd` is not a valid enum value for path `role`.")

    temp.role = "auth";
    user = new UserModel(temp);
    e = user.validateSync();
    expect(e).toBeFalsy();

    temp.role = "admin";
    user = new UserModel(temp);
    e = user.validateSync();
    expect(e).toBeFalsy();

    temp.role = "responsible";
    user = new UserModel(temp);
    e = user.validateSync();
    expect(e).toBeFalsy();
  });

  it("should not accept a invalid email", async () => {
    const temp = {
      name: "david endrew",
      email: "davideamil.com",
      password: "dddddd",
      role: "dddd"
    };

    const user = new UserModel(temp);
    const e = user.validateSync();
    expect(e.errors.email).toBeTruthy();
    expect(e.errors.email.message).toBe("Invalid email");
  });

  // FIXME
  xit("#photoURL should not accept a invalid url", async () => {
    const temp = {
      name: "david endrew",
      email: "davide@email.com",
      password: "dddddd",
      role: "responsible",
      photoURL: "dddd.coll"
    };

    let user = new UserModel(temp);
    let e = user.validateSync();
    expect(e.errors.photoURL).toBeTruthy();
    expect(e.errors.photoURL.message).toBe("Invalid url");

    temp.photoURL = "https://example.com/img.png";
    user = new UserModel(temp);
    e = user.validateSync();
    expect(e).toBeFalsy();
  });

  it("#checkPassword() with the correct password should return true", (done) => {
    const temp = {
      name: "david endrew",
      email: "davide@email.com",
      password: "ddddddddd",
      role: "responsible",
      photoURL: "dddd.coll"
    };

    const user = new UserModel(temp);
    const BCRYPT_SALT_ROUNDS = 12;
    bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS)
      .then((hashedPassword) => {
        user.password = hashedPassword;
        user.checkPassword('ddddddddd', (res) => {
          expect(res).toBe(true);
          done();
        });
        
      });
  });

  it("#checkPassword() with the wrong password should return false", (done) => {
    const temp = {
      name: "david endrew",
      email: "davide@email.com",
      password: "super secret pass",
      role: "responsible",
      photoURL: "dddd.coll"
    };

    const user = new UserModel(temp);
    const BCRYPT_SALT_ROUNDS = 12;
    bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS)
      .then((hashedPassword) => {
        user.password = hashedPassword;
        user.checkPassword('ddddddddd', (res) => {
          expect(res).toBe(false);
          done();
        });
      });
  });
  
});
