import MongodbMemoryServer from 'mongodb-memory-server';
import * as request from 'supertest';
import { App } from './app'
import { UserModel } from './models/user.model';
import { ReservationModel } from './models/reservation.model';
import { RoomModel } from './models/room.model';

describe("app", () => {
  let mongodb;
  let app;
  let authToken;
  let userProfile;
  let reservSamples: any[];
  let roomsSamples: any[];
  
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

    const roomsStbub: any[] = [
      {
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
        departmentId: "dep0003",
      },
      {
        name: "auditorio 19",
        description: "aditorion pequena, cabo so uma pessoa",
        width: 1,
        length: 1,
        capacity: 1,
        type: "auditorio",
        departmentId: "iced99",
      },
      {
        name: "laboratorio 102",
        description: "laboratorio de informatica sem computador :-(",
        width: 100,
        length: 1000,
        capacity: 300,
        type: "laboratorio",
        departmentId: "other888",
      }
    ];
    
    roomsSamples = await RoomModel.insertMany(roomsStbub);

    const reservationsStub: any[] = [
      {
        reason: "por alguma coisa razão",
        startDate: new Date("2018-08-23T00:00:00"),
        endDate: new Date("2018-08-30T00:00:00"),
        startTime: new Date("2018-01-01T08:15:00"),
        endTime: new Date("2018-01-01T12:00:00"),
        code: 10,
        sequence: 1,
        status: 'approved',
        userId: user._id,
        roomId: roomsSamples[0]._id
      },
      {
        startDate: new Date("2018-08-23T00:00:00"),
        endDate: new Date("2018-09-30T00:00:00"),
        startTime: new Date("2018-01-01T12:00:00"),
        endTime: new Date("2018-01-01T18:00:00"),
        code: 19,
        status: 'approved',
        userId: user._id,
        roomId: roomsSamples[1]._id
      },
      {
        reason: "por alguma outra coisa razão razão",
        startDate: new Date("2018-08-27T00:00:00"),
        endDate: new Date("2018-08-31T00:00:00"),
        startTime: new Date("2018-01-01T08:00:00"),
        endTime: new Date("2018-01-01T18:00:00"),
        sequence: 4,
        status: 'pending',
        userId: user._id,
        roomId: roomsSamples[2]._id
      },
      {
        reason: "por alguma coisa razão. razão etc. etc.",
        startDate: new Date("2018-08-27T00:00:00"),
        endDate: new Date("2018-08-31T00:00:00"),
        startTime: new Date("2018-01-01T08:00:00"),
        endTime: new Date("2018-01-01T12:00:00"),
        code: 10,
        sequence: 1,
        status: 'approved',
        userId: user._id,
        roomId: roomsSamples[1]._id
      },
      {
        reason: "por alguma outra coisa razão. balu, balu",
        startDate: new Date("2018-09-01T00:00:00"),
        endDate: new Date("2018-09-30T00:00:00"),
        startTime: new Date("2018-01-01T08:00:00"),
        endTime: new Date("2018-01-01T18:00:00"),
        code: 19,
        sequence: 2,
        status: 'approved',
        userId: "dkjsçf",
        roomId: roomsSamples[2]._id
      },
      {
        reason: "por alguma outra coisa razão razão. etc sabe como é",
        startDate: new Date("2018-10-01T00:00:00"),
        endDate: new Date("2018-10-30T00:00:00"),
        startTime: new Date("2018-01-01T08:00:00"),
        endTime: new Date("2018-01-01T18:00:00"),
        code: 9,
        sequence: 4,
        status: 'pending',
        userId: "92929kkkkk",
        roomId: roomsSamples[1]._id
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
        roomId: 'uniqueroomid3'
      },
      {
        reason: "por alguma........... pessoas tem razões para fazer as coisas.",
        startDate: new Date("2018-12-23T12:00:00"),
        endDate: new Date("2019-06-20T12:00:00"),
        startTime: new Date("2018-01-01T14:00:00"),
        endTime: new Date("2018-01-01T18:00:00"),
        code: 11,
        sequence: 8,
        status: 'pending',
        userId: user._id,
        roomId: 'uniqueroomid2'
      }
    ];

    reservSamples = await ReservationModel.insertMany(reservationsStub);

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

  describe("/reservations", () => {
    
    it("GET, sould return '401 authorized' for not logged user", async () => {
      const res = await request(app).get('/reservations').set('Accept', 'application/json');
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('No authorization token was found');
    });

    it("GET, should return an empty array when not find reservation with the passed status",
       async () => {
         const res = await request(app).get('/reservations?sukitos=kkkd')
           .set("Authorization", `Bearer ${authToken}`);

         expect(res.statusCode).toBe(200);
         expect(res.body.length).toBe(0);
         expect(res.body).toEqual([]);
       });

    it("GET ?status=approved, should return list of approved reservations of the current user", async () => {
      const res = await request(app).get('/reservations?status=approved')
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(3);
      
      for(let v of res.body) {
        expect(v.userId).toBe(userProfile.id);
        expect(v.status).toBe("approved");
      }
      
      expect(res.body[1].reason).toBeFalsy();
      
    });
    
    it("GET ?status=peding, should return list of pending reservations of the current user", async () => {
      const res = await request(app).get('/reservations?status=pending')
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      
      for(let v of res.body) {
        expect(v.userId).toBe(userProfile.id);
        expect(v.status).toBe("pending");
      }

      expect(res.body[0].roomId).toBe(roomsSamples[2]._id.toString());
      expect(res.body[1].roomId).toBe("uniqueroomid2");
    });

    it("GET ?status=removed, should return list of removed reservations of the current user", async () => {
      const res = await request(app).get('/reservations?status=removed')
        .set('Accept', 'application/json')
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      
      for(let v of res.body) {
        expect(v.userId).toBe(userProfile.id);
        expect(v.status).toBe("removed");
      }

      expect(res.body[0].roomId).toBe("uniqueroomid3");
    });

  });
  
  describe("/reservation", () => {

    it("POST, sould return a 401 status code for not logged user", async () => {
      const res = await request(app).post('/reservation')
        .send({
          reason: "aula de alguma coisa",
          startDate: Date.now(),
          endDate: Date.now(),
          startTime: Date.now(),
          endTime: Date.now(),
          code: 3,
          roomId: 'roomId'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('No authorization token was found');
    });
    
    it("POST, should not create a new reservation with invalid data", async () => {
      const temp =   {
        // reason: "     aula de alguma coisa<scrip src=\"https://algumnaoids.com/js.js\"</script>",
        reason: 444,
        code: -13,
        sequence: -10,
        startDate: "fkdjsçafj",
        endDate: Date.now(),
        startTime: 243124,
        endTime: "10-33",
        roomId: "rrfldças"
      };
      
      let res = await request(app).post("/reservation")
        .set("Authorization", `Bearer ${authToken}`)
        .send(temp);

      // console.log("kkkkkkkkk", res.body); // $$$$dddd
      expect(res.statusCode).toBe(422);
      expect(res.body.errors[0].param).toEqual("reason");
      expect(res.body.errors[1].param).toEqual("startDate");
      expect(res.body.errors[2].param).toEqual("endDate");
      expect(res.body.errors[3].param).toEqual("startTime");
      expect(res.body.errors[4].param).toEqual("endTime");
      expect(res.body.errors[5].param).toEqual("code");
      expect(res.body.errors[6].param).toEqual("sequence");
      expect(res.body.errors[7].param).toEqual("roomId");
      expect(res.body.errors[7].msg).toEqual("Room with id rrfldças not found");

      delete temp.roomId;
      res = await request(app).post("/reservation")
        .set("Authorization", `Bearer ${authToken}`)
        .send(temp);

      expect(res.body.errors[7].param).toEqual("roomId");
      expect(res.body.errors[7].msg).toEqual("Invalid value");
    });

    it("POST, should not create a new reservation that time/date overlaps time/date of an existing reservation", async () => {
      const temp =   {
        reason: "     aula de alguma coisa<scrip src=\"https://algumnaoids.com/js.js\"</script>",
        code: 3,
        sequence: 4,
        startDate: new Date("2018-07-23T00:00:00"),
        endDate: new Date("2018-11-30T00:00:00"),
        startTime: new Date("2018-01-01T11:00:00"),
        endTime: new Date("2018-01-01T18:00:00"),
        roomId: roomsSamples[0]._id
      };

      // first test
      
      // temp:
      //     startDate: 2018-07-23, AAAA-MM-DD
      //     endDate: 2018-11-30
      //     startTime: 11:00:00
      //     endTime: 18:00:00
      
      // overlaps,
      
      // reservSamples[0]:
      //     startDate: 2018-08-23, AAAA-MM-DD
      //     endDate: 2018-08-30
      //     startTime: 08:15:00
      //     endTime: 12:00:00

      let res = await request(app).post("/reservation")
        .set("Authorization", `Bearer ${authToken}`)
        .send(temp);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("overlapping-reservation");

      // second test
      
      temp.startDate = new Date("2018-08-23T00:00:00");
      temp.endDate = new Date("2018-08-30T00:00:00");
      temp.startTime = new Date("2018-01-01T17:00:00");
      temp.endTime = new Date("2018-01-01T18:00:00");
      temp.roomId = roomsSamples[2]._id;

      res = await request(app).post("/reservation")
        .set("Authorization", `Bearer ${authToken}`)
        .send(temp);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("overlapping-reservation");

      // third test

      temp.startDate = new Date("2018-10-30T00:00:00");
      temp.endDate = new Date("2018-10-30T00:00:00");
      temp.startTime = new Date("2018-01-01T08:00:00");
      temp.endTime = new Date("2018-01-01T18:00:00");
      temp.roomId = roomsSamples[1]._id;

      res = await request(app).post("/reservation")
        .set("Authorization", `Bearer ${authToken}`)
        .send(temp);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("overlapping-reservation");
    });

    it("/:id, DELETE, should return a 401 status code for not logged user", async () => {
      const res = await request(app).delete('/reservation/1').set('Accept', 'application/json');
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('No authorization token was found');
    });

    it("/:id, DELETE, should return a message for not found reservation", async () => {
      const res = await request(app).delete(`/reservation/fkldjsfç`)
        .set("Authorization", `Bearer ${authToken}`).set("Accept", "application/json");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Reservation not found");
    });

    it("/:id, DELETE, should return a 403 status code when trying to delete a reservation marked as removed",
       async () => {
         const res = await request(app).delete(`/reservation/${reservSamples[6]._id}`)
           .set("Authorization", `Bearer ${authToken}`).set("Accept", "application/json");

         expect(res.statusCode).toBe(403);
       });
    
    it("DELETE, should remove 'pending' reservations from database", async () => {
      const res = await request(app).delete(`/reservation/${reservSamples[7]._id}`)
        .set("Authorization", `Bearer ${authToken}`).set("Accept", "application/json");

      expect(res.statusCode).toBe(200);
      expect(res.body.item._id).toBe(reservSamples[7]._id.toString());
      expect(res.body.item.status).toBe("pending");
    });
    
    test("DELETE, should mark 'approved' reservations as 'removed'", async () => {
      const res = await request(app).delete(`/reservation/${reservSamples[3]._id}`)
        .set("Authorization", `Bearer ${authToken}`).set("Accept", "application/json");
      
      expect(reservSamples[3].status).toBe("approved");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.item._id).toBe(reservSamples[3]._id.toString());
      expect(res.body.item.status).toBe("removed");
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

