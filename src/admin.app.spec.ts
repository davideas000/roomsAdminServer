import * as mongoose from "mongoose";
import * as request from 'supertest';
import { App } from './app'
import { UserModel } from './models/user.model';
import { ReservationModel } from './models/reservation.model';
import { RoomModel } from './models/room.model';
import { DepartmentModel } from './models/department.model';
import { ReservationController } from './controllers/reservation.controller';

describe("app", () => {
  let mongodb;
  let app;
  let authToken;

  let userProfile;
  let authTokenResponsible;
  let userProfileResponsible;
  let authTokenAdmin;
  let userProfileAdmin;
  let reservSamples: any[];
  let roomsSamples: any[];
  let depsSamples: any[];

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

    const userAdmin = new UserModel({
      name: 'admin user',
      email: 'admin@email.com',
      password: 'super secret password2',
      role: 'admin'
    });

    await userAdmin.save();

    const depsStub: any[] = [
      {
        name: "Institutite of stuffs",
        acronym: "IEG",
        user: userResponsible._id
      },
      {
        name: "Institutite of other",
        acronym: "UOG",
        user: new mongoose.Types.ObjectId()
      }
    ];

    depsSamples = await DepartmentModel.insertMany(depsStub);

    const roomsStbub: any[] = [
      { // 0
        name: "sala 01",
        description: "sala grande, sem arcondicionado",
        width: 10,
        length: 100,
        capacity: 10,
        location: {
          lat: 10,
          long: 30
        },
        type: "sala",
        department: depsSamples[1]._id,
        photos: ["./storage/photo1.png", "./storage/photo2.png"]
      },

      { // 1
        name: "auditorio 19",
        description: "aditorion pequena, cabo so uma pessoa",
        width: 1,
        length: 1,
        capacity: 1,
        type: "auditorio",
        department: depsSamples[1]._id
      },

      { // 2
        name: "laboratorio 102",
        description: "laboratorio de informatica sem computador :-(",
        width: 100,
        length: 1000,
        capacity: 300,
        type: "laboratorio",
        department: depsSamples[0]._id
      },

      { // 3
        name: "sala 101",
        description: "sala do dep 0",
        width: 2,
        length: 2,
        capacity: 2,
        location: {
          lat: 10,
          long: 30
        },
        type: "sala",
        department: depsSamples[0]._id,
        photos: ["./storage/silo.png", "./storage/silo.png"]
      },
    ];

    roomsSamples = await RoomModel.insertMany(roomsStbub);

    const reservationsStub: any[] = [

      { // 0
        reason: "por alguma coisa razão",
        startDate: new Date("2018-08-23T00:00:00+0000"),
        endDate: new Date("2018-08-30T00:00:00+0000"),
        startTime: new Date("2018-01-01T08:15:00+0000"),
        endTime: new Date("2018-01-01T12:00:00+0000"),
        code: 10,
        sequence: 1,
        status: 'approved',
        user: user._id,
        room: roomsSamples[2]._id
      },

      { // 1
        startDate: new Date("2018-08-23T00:00:00+0000"),
        endDate: new Date("2018-09-30T00:00:00+0000"),
        startTime: new Date("2018-01-01T12:00:00+0000"),
        endTime: new Date("2018-01-01T18:00:00+0000"),
        code: 19,
        status: 'pending',
        user: user._id,
        room: roomsSamples[2]._id
      },

      { // 2
        reason: "por alguma outra coisa razão razão",
        startDate: new Date("2018-08-27T00:00:00+0000"),
        endDate: new Date("2018-08-31T00:00:00+0000"),
        startTime: new Date("2018-01-01T08:00:00+0000"),
        endTime: new Date("2018-01-01T18:00:00+0000"),
        sequence: 4,
        status: 'removed',
        user: user._id,
        room: roomsSamples[1]._id
      },

      { // 3
        reason: "por alguma coisa razão. razão etc. etc.",
        startDate: new Date("2018-08-27T00:00:00+0000"),
        endDate: new Date("2018-08-31T00:00:00+0000"),
        startTime: new Date("2018-01-01T08:00:00+0000"),
        endTime: new Date("2018-01-01T12:00:00+0000"),
        code: 10,
        sequence: 1,
        status: 'pending',
        user: userResponsible._id,
        room: roomsSamples[1]._id
      },

      { // 4
        reason: "por alguma outra coisa razão. balu, balu",
        startDate: new Date("2018-09-01T00:00:00+0000"),
        endDate: new Date("2018-09-30T00:00:00+0000"),
        startTime: new Date("2018-01-01T08:00:00+0000"),
        endTime: new Date("2018-01-01T18:00:00+0000"),
        code: 19,
        sequence: 2,
        status: 'removed',
        user: userResponsible._id,
        room: roomsSamples[0]._id
      },

      { // 5
        reason: "por alguma outra coisa razão razão. etc sabe como é",
        startDate: new Date("2019-11-01T00:00:00+0000"),
        endDate: new Date("2019-11-30T00:00:00+0000"),
        startTime: new Date("2018-01-01T08:00:00+0000"),
        endTime: new Date("2018-01-01T18:00:00+0000"),
        code: 9,
        sequence: 4,
        status: 'approved',
        user: userResponsible._id,
        room: roomsSamples[1]._id
      },

      { // 6
        reason: "por alguma outra coisa razão razão. etc sabe como é",
        startDate: new Date("2019-10-01T00:00:00+0000"),
        endDate: new Date("2019-10-30T00:00:00+0000"),
        startTime: new Date("2018-01-01T08:00:00+0000"),
        endTime: new Date("2018-01-01T18:00:00+0000"),
        code: 9,
        sequence: 4,
        status: 'pending',
        user: userResponsible._id,
        room: roomsSamples[2]._id
      },

      { // 7
        reason: "por alguma outra coisa razão razão. etc sabe como é",
        startDate: new Date("2020-10-01T00:00:00+0000"),
        endDate: new Date("2020-10-30T00:00:00+0000"),
        startTime: new Date("2018-01-01T08:00:00+0000"),
        endTime: new Date("2018-01-01T18:00:00+0000"),
        code: 99,
        sequence: 4,
        status: 'approved',
        user: user._id,
        room: roomsSamples[3]._id
      }

    ];

    reservSamples = await ReservationModel.insertMany(reservationsStub);

    let res = await request(app).post("/login")
      .send({email: "test@email.com", password: "super secret password"})
      .set("Accept", "application/json");
    authToken = res.body.token;
    userProfile = res.body.profile;

    res = await request(app).post("/login")
      .send({email: "responsible@email.com", password: "super secret password2"})
      .set("Accept", "application/json");
    authTokenResponsible = res.body.token;
    userProfileResponsible = res.body.profile;

    res = await request(app).post("/login")
      .send({email: "admin@email.com", password: "super secret password2"})
      .set("Accept", "application/json");
    authTokenAdmin = res.body.token;
    userProfileAdmin = res.body.profile;
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

  it('GET /admin/users, should return a 401 status code for'
     + 'a not logged in user', async() => {
       const resp = await request(app).get('/admin/users');
       expect(resp.statusCode).toBe(401)
       expect(resp.body.message).toBe('No authorization token was found');
     });

  it('GET /admin/users, should return a 401 status code for'
     + 'a not admin user', async() => {
       const resp = await request(app).get('/admin/users')
         .set('Authorization', `Bearer ${authToken}`);
       expect(resp.statusCode).toBe(401)
       expect(resp.body.message).toBe('User not authorized');
     });

  it('GET /admin/users, should return all the users', async() => {
    // it doesn't return the admin user
    const resp = await request(app).get('/admin/users')
      .set('Authorization', `Bearer ${authTokenAdmin}`);
    expect(resp.statusCode).toBe(200);
    expect(resp.body.length).toBe(2);
    expect(resp.body[0]._id).toBe(userProfile._id);
    expect(resp.body[0].password).toBeFalsy();
    expect(resp.body[0].role).toBe(userProfile.role);
    expect(resp.body[1].role).toBe(userProfileResponsible.role);
    expect(resp.body[1].password).toBeFalsy();
  });
});

