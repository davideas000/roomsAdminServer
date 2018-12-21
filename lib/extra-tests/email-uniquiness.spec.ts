import * as mongoose from "mongoose";
import * as request from 'supertest';
import { App } from '../app';
import { UserModel } from '../models/user.model';

describe('app', () => {
  let mongodb;
  let app;
  let authToken;

  beforeAll(async () => {
    mongoose.Promise = Promise;
    const mongoURI = "mongodb://raTests:raTests@localhost:27017/raTests";
    app = new App().app;
    mongoose.connect(mongoURI, {useNewUrlParser: true});

    mongoose.connection.on('error', (e) => {
      console.log(e);
    });

    mongoose.connection.once('open', () => {
      console.log(`MongoDB successfully connected to ${mongoURI}`);
    });
  });

  beforeEach(async () => {
    const user = new UserModel({
      name: 'test person',
      email: 'test@email.com',
      password: 'super secret password',
      role: 'auth'
    });

    await user.save();

    const userResponsible = new UserModel({
      name: 'user responsible',
      email: 'responsible@email.com',
      password: 'super secret password2',
      role: 'responsible'
    });

    await userResponsible.save();

    let res = await request(app).post("/login")
      .send({email: "test@email.com", password: "super secret password"})
      .set("Accept", "application/json");
    authToken = res.body.token;
  });

  afterEach((done) => {
    mongoose.connection.db.dropDatabase(() => {
      console.log("cleaning database");
      done();
    });
  });

  afterAll(async () => {
    mongoose.disconnect();
    mongodb.stop();
  });

  it('PUT /profile should return a 401 status code '
     + 'when the user is updating to a duplicated email',
     async () => {
       let newData = {
         name: 'user name',
         displayName: '     a',
         email: 'responsible@email.com'
       };
       let res = await request(app).put("/profile")
         .send(newData)
         .set("Authorization", `Bearer ${authToken}`);
       expect(res.statusCode).toBe(401);
       expect(res.body.message).toBe('duplicate-email');
     });
});
