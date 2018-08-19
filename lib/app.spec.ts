import MongodbMemoryServer from 'mongodb-memory-server';
import * as request from 'supertest';
import { App } from './app'
import { UserModel } from './models/user.model';
import { ReservationModel } from './models/reservation.model';

describe("app", () => {
  let mongodb;
  let app;
  let authToken;
  let userProfile;
  
  beforeAll(async () => {
    mongodb = new MongodbMemoryServer();
    const mongoURI = await mongodb.getConnectionString();
    app = new App(mongoURI).app;
    
    const user = new UserModel({
      name: 'test person',
      email: 'test@email.com',
      password: 'super secret password',
      role: 'auth'
    });

    await user.save();

    const reservationsStub = [
      {
        reason: "por alguma coisa razão",
        startDate: Date.now(),
        endDate: Date.now(),
        startTime: Date.now(),
        endTime: Date.now(),
        code: 10,
        sequence: 1,
        status: 'aproved',
        userId: user._id,
        roomId: 'blabal100'
      },
      {
        startDate: Date.now(),
        endDate: Date.now(),
        startTime: Date.now(),
        endTime: Date.now(),
        code: 19,
        status: 'aproved',
        userId: user._id,
        roomId: 'fkdsjf000'
      },
      {
        reason: "por alguma outra coisa razão razão",
        startDate: Date.now(),
        endDate: Date.now(),
        startTime: Date.now(),
        endTime: Date.now(),
        sequence: 4,
        status: 'pending',
        userId: user._id,
        roomId: 'sula0001'
      },
      {
        reason: "por alguma coisa razão. razão etc. etc.",
        startDate: Date.now(),
        endDate: Date.now(),
        startTime: Date.now(),
        endTime: Date.now(),
        code: 10,
        sequence: 1,
        status: 'aproved',
        userId: user._id,
        roomId: 'blabal100'
      },
      {
        reason: "por alguma outra coisa razão. balu, balu",
        startDate: Date.now(),
        endDate: Date.now(),
        startTime: Date.now(),
        endTime: Date.now(),
        code: 19,
        sequence: 2,
        status: 'aproved',
        userId: "dkjsçf",
        roomId: 'fkdsjf000'
      },
      {
        reason: "por alguma outra coisa razão razão. etc sabe como é",
        startDate: Date.now(),
        endDate: Date.now(),
        startTime: Date.now(),
        endTime: Date.now(),
        code: 9,
        sequence: 4,
        status: 'pending',
        userId: "92929kkkkk",
        roomId: 'sula0002'
      },
      {
        reason: "por alguma........... coisa razão. razão etc. etc.",
        startDate: Date.now(),
        endDate: Date.now(),
        startTime: Date.now(),
        endTime: Date.now(),
        code: 11,
        sequence: 8,
        status: 'removed',
        userId: user._id,
        roomId: 'blabal100999'
      },
    ];

    await ReservationModel.insertMany(reservationsStub);
    
    const res = await request(app).post("/login")
      .send({email: "test@email.com", password: "super secret password"})
      .set("Accept", "application/json");
    authToken = res.body.token;
    userProfile = res.body.profile;
  });

  afterAll(async () => {
    mongodb.stop();
  });
  
  it("must be created", () => {
    expect(app).toBeTruthy();
  });

  it("should return a message from '/' route", async () => {
    const res = await request(app).get('/').set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Api endpoint');
  });

  it("should return 404 for not found route", async () => {
    const res = await request(app).get('/other').set('Accept', 'application/json');
    expect(res.statusCode).toBe(404);
  });

  describe("/reserv-a", () => {
    
    it("GET, sould return '401 authorized' for not logged user", async () => {
      const res = await request(app).get('/reserv-a').set('Accept', 'application/json');
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('No authorization token was found');
    });

    it("GET, sould return reservations list for logged in user", async () => {
      const res = await request(app).get('/reserv-a')
        .set('Accept', 'application/json')
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(3);
      
      for(let v of res.body) {
        expect(v.userId).toBe(userProfile.id);
        expect(v.status).toBe("aproved");
      }
      
      expect(res.body[1].reason).toBeFalsy();
      
    });
    
  });

  describe("/login, POST", () => {
    
    it("should return a jwt token for a correct login", async () => {
      const res = await request(app).post('/login')
        .send({email: "test@email.com", password: "super secret password"})
        .set("Accept", "application/json");

      const body = res.body;
      expect(res.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.token).toBeTruthy();
      expect(body.profile.name).toBe('test person');
      expect(body.profile.email).toBe('test@email.com');
      expect(body.profile.role).toBe('auth');
      expect(body.profile.password).toBeFalsy();
    });
    
    it("should return a error for incorrect email", async () => {
      const res = await request(app).post('/login')
        .send({email: "test@email.kcom", password: "super secret password"})
        .set("Accept", "application/json");

      const body = res.body;
      expect(res.statusCode).toBe(200);
      expect(body.success).toBe(false);
      expect(body.token).toBeFalsy();
      expect(body.message).toBe('user-not-found');
    });
    
    it("should return a error for incorrect password", async () => {
      const res = await request(app).post('/login')
        .send({email: "test@email.com", password: "kkk kkkk"})
        .set("Accept", "application/json");

      const body = res.body;
      expect(res.statusCode).toBe(200);
      expect(body.success).toBe(false);
      expect(body.token).toBeFalsy();
      expect(body.message).toBe('invalid-password');
    });

  });
  
});

