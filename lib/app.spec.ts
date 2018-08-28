import MongodbMemoryServer from 'mongodb-memory-server';
import * as request from 'supertest';
import { App } from './app'
import { UserModel } from './models/user.model';
import { ReservationModel } from './models/reservation.model';
import { RoomModel } from './models/room.model';
import { DepartmentModel } from './models/department.model';

describe("app", () => {
  let mongodb;
  let app;
  let authToken;

  let userProfile;
  let authTokenResponsible;
  let userProfileResponsible;
  let reservSamples: any[];
  let roomsSamples: any[];
  let depsSamples: any[];
  
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
    userProfile = res.body.profile;

    res = await request(app).post("/login")
      .send({email: "responsible@email.com", password: "super secret password2"})
      .set("Accept", "application/json");
    authTokenResponsible = res.body.token;
    userProfileResponsible = res.body.profile;

    const depsStub: any[] = [
      {
        name: "Institutite of stuffs",
        acronym: "IEG",
        userId: userProfileResponsible._id
      },
      {
        name: "Institutite of other",
        acronym: "UOG",
        userId: "fkdjasçfjç"
      }
    ];

    depsSamples = await DepartmentModel.insertMany(depsStub);
    
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
        departmentId: depsSamples[1]._id
      },
      
      {
        name: "auditorio 19",
        description: "aditorion pequena, cabo so uma pessoa",
        width: 1,
        length: 1,
        capacity: 1,
        type: "auditorio",
        departmentId: depsSamples[1]._id
      },
      
      {
        name: "laboratorio 102",
        description: "laboratorio de informatica sem computador :-(",
        width: 100,
        length: 1000,
        capacity: 300,
        type: "laboratorio",
        departmentId: depsSamples[0]._id
      }
    ];
    
    roomsSamples = await RoomModel.insertMany(roomsStbub);

    const reservationsStub: any[] = [
      
      { // 0
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
      
      { // 1
        startDate: new Date("2018-08-23T00:00:00"),
        endDate: new Date("2018-09-30T00:00:00"),
        startTime: new Date("2018-01-01T12:00:00"),
        endTime: new Date("2018-01-01T18:00:00"),
        code: 19,
        status: 'approved',
        userId: user._id,
        roomId: roomsSamples[1]._id
      },
      
      { // 2
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
      
      { // 3
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
      
      { // 4
        reason: "por alguma outra coisa razão. balu, balu",
        startDate: new Date("2018-09-01T00:00:00"),
        endDate: new Date("2018-09-30T00:00:00"),
        startTime: new Date("2018-01-01T08:00:00"),
        endTime: new Date("2018-01-01T18:00:00"),
        code: 19,
        sequence: 2,
        status: 'approved',
        userId: "dkjsçf",
        roomId: roomsSamples[0]._id
      },
      
      { // 5
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
      
      { // 6
        reason: "por alguma........... coisa razão. razão etc. etc.",
        startDate: Date.now(),
        endDate: Date.now(),
        startTime: Date.now(),
        endTime: Date.now(),
        code: 11,
        sequence: 8,
        status: 'removed',
        userId: user._id,
        roomId: roomsSamples[0]._id
      },
      
      { // 7
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
      },
      
      { // 8
        reason: "por alguma coisa, coisa.",
        startDate: new Date("2019-04-23T00:00:00"),
        endDate: new Date("2019-06-20T00:00:00"),
        startTime: new Date("2018-01-01T14:00:00"),
        endTime: new Date("2018-01-01T18:00:00"),
        code: 11,
        sequence: 8,
        status: 'pending',
        userId: userResponsible._id,
        roomId: roomsSamples[2]._id
      },
      
      { // 9
        reason: "por alguma coisa, coisa, coisa.",
        startDate: new Date("2019-04-23T00:00:00"),
        endDate: new Date("2019-06-20T00:00:00"),
        startTime: new Date("2018-01-01T14:00:00"),
        endTime: new Date("2018-01-01T18:00:00"),
        code: 11,
        sequence: 8,
        status: 'pending',
        userId: userResponsible._id,
        roomId: roomsSamples[0]._id
      },
      
      { // 10
        reason: "por alguma coisa, coisa, coisa.",
        startDate: new Date("2019-04-23T00:00:00"),
        endDate: new Date("2019-06-20T00:00:00"),
        startTime: new Date("2018-01-01T14:00:00"),
        endTime: new Date("2018-01-01T18:00:00"),
        code: 11,
        sequence: 8,
        status: 'approved',
        userId: userResponsible._id,
        roomId: roomsSamples[2]._id
      },

      { // 11
        reason: "por alguma coisa, coisa, coisa. 11",
        startDate: new Date("2019-04-23T00:00:00"),
        endDate: new Date("2019-06-20T00:00:00"),
        startTime: new Date("2018-01-01T14:00:00"),
        endTime: new Date("2018-01-01T18:00:00"),
        code: 11,
        sequence: 8,
        status: 'pending',
        userId: "user0001",
        roomId: roomsSamples[1]._id
      },

      { // 12
        reason: "por alguma coisa, coisa, coisa. 12",
        startDate: new Date("2019-04-23T00:00:00"),
        endDate: new Date("2019-06-20T00:00:00"),
        startTime: new Date("2018-01-01T14:00:00"),
        endTime: new Date("2018-01-01T18:00:00"),
        code: 11,
        sequence: 8,
        status: 'approved',
        userId: userResponsible._id,
        roomId: roomsSamples[1]._id
      },

      { // 13
        reason: "por alguma coisa, coisa, coisa. 13",
        startDate: new Date("2019-04-23T00:00:00"),
        endDate: new Date("2019-06-20T00:00:00"),
        startTime: new Date("2018-01-01T14:00:00"),
        endTime: new Date("2018-01-01T18:00:00"),
        code: 11,
        sequence: 8,
        status: 'approved',
        userId: user._id,
        roomId: roomsSamples[0]._id
      },

      { // 14
        reason: "por alguma coisa, coisa, coisa. 14",
        startDate: new Date("2019-04-23T00:00:00"),
        endDate: new Date("2019-06-20T00:00:00"),
        startTime: new Date("2018-01-01T14:00:00"),
        endTime: new Date("2018-01-01T18:00:00"),
        code: 11,
        sequence: 8,
        status: 'pending',
        userId: user._id,
        roomId: roomsSamples[0]._id
      }
      
    ];

    reservSamples = await ReservationModel.insertMany(reservationsStub);
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
      expect(res.body.length).toBe(4);
      
      for(let v of res.body) {
        expect(v.userId).toBe(userProfile._id);
        expect(v.status).toBe("approved");
      }
      
      expect(res.body[1].reason).toBeFalsy();
      
    });
    
    it("GET ?status=peding, should return list of pending reservations of the current user", async () => {
      const res = await request(app).get('/reservations?status=pending')
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(3);
      
      for(let v of res.body) {
        expect(v.userId).toBe(userProfile._id);
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
        expect(v.userId).toBe(userProfile._id);
        expect(v.status).toBe("removed");
      }

      expect(res.body[0].roomId).toBe(roomsSamples[0]._id.toString());
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
        reason: "     aula de alguma coisa<scrip src=\"https://algumnaoids.com/js.js\"</script>",
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

      expect(res.statusCode).toBe(422);
      expect(res.body.errors[0].param).toEqual("reason");
      expect(res.body.errors[1].param).toEqual("startDate");
      expect(res.body.errors[2].param).toEqual("endDate");
      expect(res.body.errors[3].param).toEqual("startTime");
      expect(res.body.errors[4].param).toEqual("endTime");
      expect(res.body.errors[5].param).toEqual("code");
      expect(res.body.errors[6].param).toEqual("sequence");
      expect(res.body.errors[7].param).toEqual("roomId");
      expect(res.body.errors[7].msg).toEqual(
        "Cast to ObjectId failed for value \"rrfldças\" at path \"_id\" for model \"Room\"");

      delete temp.roomId;
      res = await request(app).post("/reservation")
        .set("Authorization", `Bearer ${authToken}`)
        .send(temp);

      expect(res.body.errors[7].param).toEqual("roomId");
      expect(res.body.errors[7].msg).toEqual("Invalid value");
    });

    it(
      "POST, should not create a new reservation that time/date overlaps time/date of an existing reservation",
      async () => {
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

    it("POST, should create a new reservation if valid data", async () => {
      
      const temp = {
        reason: "aula de alguma coisa",
        code: 3,
        sequence: 4,
        startDate: new Date("2018-08-23T00:00:00"),
        endDate: new Date("2018-09-30T00:00:00"),
        startTime: new Date("2018-01-01T18:00:00"),
        endTime: new Date("2018-01-01T22:00:00"),
        roomId: roomsSamples[1]._id
      };

      // first test
      let res = await request(app).post("/reservation")
        .set("Authorization", `Bearer ${authToken}`)
        .send(temp);

      let r = res.body.item;

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true);
      expect(r.reason).toBe(temp.reason);
      expect(new Date(r.startDate)).toEqual(temp.startDate);
      expect(new Date(r.endDate)).toEqual(temp.endDate);
      expect(new Date(r.startTime)).toEqual(temp.startTime);
      expect(new Date(r.endTime)).toEqual(temp.endTime);
      expect(r.code).toBe(temp.code);
      expect(r.sequence).toBe(temp.sequence);
      expect(r.status).toBe("pending");
      expect(r.userId).toBe(userProfile._id);
      expect(r.roomId).toBe(temp.roomId.toString());
      expect(r.createdAt).toBeTruthy();
      expect(r.updatedAt).toBeTruthy();

      // second test
      delete temp.code;
      delete temp.sequence;
      delete temp.reason;
      temp.roomId = roomsSamples[2]._id;

      temp.startDate = new Date("2019-01-12T00:00:00");
      temp.endDate = new Date("2018-05-30T00:00:00");
      temp.startTime = new Date("2018-01-01T14:00:00");
      temp.endTime = new Date("2018-01-01T15:30:00");
      
      res = await request(app).post("/reservation")
        .set("Authorization", `Bearer ${authToken}`)
        .send(temp);

      r = res.body.item;

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true);
      expect(r.reason).toBeUndefined();
      expect(new Date(r.startDate)).toEqual(temp.startDate);
      expect(new Date(r.endDate)).toEqual(temp.endDate);
      expect(new Date(r.startTime)).toEqual(temp.startTime);
      expect(new Date(r.endTime)).toEqual(temp.endTime);
      expect(r.code).toBeUndefined();
      expect(r.sequence).toBeUndefined();
      expect(r.status).toBe("pending");
      expect(r.userId).toBe(userProfile._id);
      expect(r.roomId).toBe(temp.roomId.toString());
      expect(r.createdAt).toBeTruthy();
      expect(r.updatedAt).toBeTruthy();
    });

  });

  describe("/reservation/:id", () =>{
    
    describe("DELETE", () => {

      it("should return a 401 status code for not logged user", async () => {
        const res = await request(app).delete('/reservation/1').set('Accept', 'application/json');
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('No authorization token was found');
      });

      it("should return a message for not found reservation", async () => {
        const res = await request(app).delete(`/reservation/fkldjsfç`)
          .set("Authorization", `Bearer ${authToken}`).set("Accept", "application/json");

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Reservation not found");
      });

      it("should return a 403 status code when trying to delete a reservation marked as removed",
         async () => {
           const res = await request(app).delete(`/reservation/${reservSamples[6]._id}`)
             .set("Authorization", `Bearer ${authToken}`).set("Accept", "application/json");

           expect(res.statusCode).toBe(403);
         });
      
      it("should remove 'pending' reservations from database", async () => {
        const res = await request(app).delete(`/reservation/${reservSamples[7]._id}`)
          .set("Authorization", `Bearer ${authToken}`).set("Accept", "application/json");

        expect(res.statusCode).toBe(200);
        expect(res.body.item._id).toBe(reservSamples[7]._id.toString());
        expect(res.body.item.status).toBe("pending");
      });
      
      it("should mark 'approved' reservations as 'removed'", async () => {
        const res = await request(app).delete(`/reservation/${reservSamples[3]._id}`)
          .set("Authorization", `Bearer ${authToken}`).set("Accept", "application/json");
        
        expect(reservSamples[3].status).toBe("approved");
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.item._id).toBe(reservSamples[3]._id.toString());
        expect(res.body.item.status).toBe("removed");
      });
      
    });

    describe("PUT", () => {

      it("should not accept a invalid status", async () => {
        let res = await request(app).put(`/reservation/${reservSamples[2]._id}`)
          .set("Authorization", `Bearer ${authTokenResponsible}`)
          .send({status: "approvedp"});

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("invalid status: approvedp");

        res = await request(app).put(`/reservation/${reservSamples[13]._id}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({status: "removid"});

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("invalid status: removid");
      });

      //////////////////////////////////////////////////////////////////////////////
      ////////////////////////// USER (TYPE: RESPONSIBLE) //////////////////////////
      //////////////////////////////////////////////////////////////////////////////
      
      // A user of the responsible type can only approve a pending reservation
      // belonging to the department for which he is responsible.
      it("should let a user of type responsible approve a pending reservation", async () => {
        let res = await request(app).put(`/reservation/${reservSamples[2]._id}`)
          .set("Authorization", `Bearer ${authTokenResponsible}`)
          .send({status: "approved"});

        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("reservation modified");

        res = await request(app).put(`/reservation/${reservSamples[8]._id}`)
          .set("Authorization", `Bearer ${authTokenResponsible}`)
          .send({status: "approved"});

        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("reservation modified");
      });

      // A user of the responsible type can only remove a approved reservation
      // belonging to the department for which he is responsible
      // or that belongs to himself.
      it("should let a user of type responsible 'remove' a approved reservation", async () => {

        let res = await request(app).put(`/reservation/${reservSamples[10]._id}`)
          .set("Authorization", `Bearer ${authTokenResponsible}`)
          .send({status: "removed"});
        
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("reservation modified");

        // a user can mark as removed an approved reservation that belongs to himself
        res = await request(app).put(`/reservation/${reservSamples[12]._id}`) // approved reservation
          .set("Authorization", `Bearer ${authTokenResponsible}`)
          .send({status: "removed"});

        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("reservation modified");
        
      });
      
      // A user of the responsible type can only approve a pending reservation
      // belonging to the department for which he is responsible.
      it(
        "should not let a user of the responsible type approve a reservation\n" +
          "that does not belong to the department to which he is responsible",
        async () => {
          let res = await request(app).put(`/reservation/${reservSamples[5]._id}`)
            .set("Authorization", `Bearer ${authTokenResponsible}`)
            .send({status: "approved"});

          expect(res.body.success).toBe(false);
          expect(res.body.message).toBe("user not authorized");

          res = await request(app).put(`/reservation/${reservSamples[9]._id}`)
            .set("Authorization", `Bearer ${authTokenResponsible}`)
            .send({status: "approved"});

          expect(res.body.success).toBe(false);
          expect(res.body.message).toBe("user not authorized");

        });
      
      it("should not let a user of the responsible type approve/remove a approved/removed reservation",
         async () => {
           let res = await request(app).put(`/reservation/${reservSamples[6]._id}`)
             .set("Authorization", `Bearer ${authTokenResponsible}`)
             .send({status: "removed"});

           expect(res.body.success).toBe(false);
           expect(res.body.message).toBe("reservation already removed");

           // it should not be possible to approve a removed reservation
           res = await request(app).put(`/reservation/${reservSamples[6]._id}`)
             .set("Authorization", `Bearer ${authTokenResponsible}`)
             .send({status: "approved"});

           expect(res.body.success).toBe(false);
           expect(res.body.message).toBe("reservation already removed");

           res = await request(app).put(`/reservation/${reservSamples[4]._id}`)
             .set("Authorization", `Bearer ${authTokenResponsible}`)
             .send({status: "approved"});
           
           expect(res.body.success).toBe(false);
           expect(res.body.message).toBe("reservation already approved");

         });
      
      it("should not let a user of responsible type mark as removed a pending reservation",
         async () => {
           let res = await request(app).put(`/reservation/${reservSamples[11]._id}`)
             .set("Authorization", `Bearer ${authTokenResponsible}`)
             .send({status: "removed"});
           expect(res.body.success).toBe(false);
           expect(res.body.message).toBe("cannot remove a pending reservation");
         });

      ////////////////////////////////////////////////////////////////////////
      /////////////////////////// USER (TYPE: AUTH) //////////////////////////
      ////////////////////////////////////////////////////////////////////////

      // a user of the auth type cannot modify others reservations and he
      // cannot modify reservations that belongs to himself unless
      // it is marked as approved and he is trying mark it as removed
      it("should let a user of the auth type remove an approved reservation that belongs to himself", async () => {
        let res = await request(app).put(`/reservation/${reservSamples[0]._id}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({status: "removed"});
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("reservation modified");
      });
      
      it("should not let a user of auth type approve a reservation", async () => {
        let res = await request(app).put(`/reservation/${reservSamples[14]._id}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({status: "approved"});
        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("user not authorized");
      });
      
      it("should not let a user of auth type remove a already removed reservation", async () => {
        let res = await request(app).put(`/reservation/${reservSamples[6]._id}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({status: "removed"});
        
        expect(res.body.message).toBe("reservation already removed");
        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
      });

      it("should not let a user of the auth type modify others reservations", async () => {
        let res = await request(app).put(`/reservation/${reservSamples[4]._id}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({status: "removed"});
        
        expect(res.body.message).toBe("user not authorized");
        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);

        res = await request(app).put(`/reservation/${reservSamples[5]._id}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({status: "removed"});
        
        expect(res.body.message).toBe("user not authorized");
        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
      });
      
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

