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
  
  it("must be created", () => {
    expect(app).toBeDefined();
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

      const n = await ReservationModel.countDocuments(
        {user: userProfile._id, status: 'approved'}
      );
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(n);
      
      for(let v of res.body) {
        expect(v.user).toBe(userProfile._id);
        expect(v.status).toBe("approved");
        expect(v.room._id).toBeDefined();
        expect(v.room.name).toBeDefined();
        expect(v.room.createdAt).toBeDefined();
        expect(v.room.updatedAt).toBeDefined();
        expect(v.room.department._id).toBeDefined();
        expect(v.room.department.name).toBeDefined();
        expect(v.room.department.acronym).toBeDefined();
        expect(v.room.department.createdAt).toBeDefined();
        expect(v.room.department.updatedAt).toBeDefined();
      }
      
    });
    
    it("GET ?status=pending, should return list of pending reservations of the current user", async () => {
      const res = await request(app).get('/reservations?status=pending')
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      
      for(let v of res.body) {
        expect(v.user).toBe(userProfile._id);
        expect(v.status).toBe("pending");
        expect(v.room._id).toBeDefined();
        expect(v.room.name).toBeDefined();
        expect(v.room.createdAt).toBeDefined();
        expect(v.room.updatedAt).toBeDefined();
        expect(v.room.department._id).toBeDefined();
        expect(v.room.department.name).toBeDefined();
        expect(v.room.department.acronym).toBeDefined();
        expect(v.room.department.createdAt).toBeDefined();
        expect(v.room.department.updatedAt).toBeDefined();
      }

      expect(res.body[0].room._id).toBe(roomsSamples[2]._id.toString());
    });

    it('GET ?status=pending&by=dep, should return a list of pending reservations '
       + 'by departement', async () => {
         const res = await request(app).get('/reservations?status=pending&by=dep')
           .set("Authorization", `Bearer ${authTokenResponsible}`);
         const depTemp = await DepartmentModel.findOne({user: userProfileResponsible._id});

         expect(res.statusCode).toBe(200);
         expect(res.body.length).toBe(2);

         for(let v of res.body) {
           expect(v.room.department.acronym).toBe(depTemp.acronym);
           expect(v.status).toBe('pending');
           // ensure that the user'password isn't being sent with the reservations
           expect(v.user.password).toBeUndefined();
         }
       });

    it('GET ?status=pending&op=countdep, should return the number of pending reservations '
       + 'by department when the user\'s role is responsble', async () => {
         const res = await request(app).get('/reservations?status=pending&op=countdep')
           .set("Authorization", `Bearer ${authTokenResponsible}`);
         expect(res.statusCode).toBe(200);
         expect(res.body.result).toBe(2);
       });

    it('GET ?status=approved&op=countdep, should return the number of approved reservations '
       + 'by department when the user\'s role is responsble', async () => {
         const res = await request(app).get('/reservations?status=approved&op=countdep')
           .set("Authorization", `Bearer ${authTokenResponsible}`);
         expect(res.statusCode).toBe(200);
         expect(res.body.result).toBe(2);
       });

    it('GET ?status=pending&op=countdep, should return a 401 status code for a '
       + 'user of the auth type', async () => {
         const res = await request(app).get('/reservations?status=pending&op=countdep')
           .set("Authorization", `Bearer ${authToken}`);

         expect(res.statusCode).toBe(401);
         expect(res.body.message).toBe('user-not-authorized');
       });

    it("GET ?status=removed, should return list of removed reservations of the current user", async () => {
      const res = await request(app).get('/reservations?status=removed')
        .set('Accept', 'application/json')
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      
      for(let v of res.body) {
        expect(v.user).toBe(userProfile._id);
        expect(v.status).toBe("removed");
        expect(v.room._id).toBeDefined();
        expect(v.room.name).toBeDefined();
        expect(v.room.createdAt).toBeDefined();
        expect(v.room.updatedAt).toBeDefined();
        expect(v.room.department._id).toBeDefined();
        expect(v.room.department.name).toBeDefined();
        expect(v.room.department.acronym).toBeDefined();
        expect(v.room.department.createdAt).toBeDefined();
        expect(v.room.department.updatedAt).toBeDefined();
      }

      expect(res.body[0].room._id).toBe(roomsSamples[1]._id.toString());
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
          room: 'room'
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
        room: "rrfldças"
      };
      
      let res = await request(app).post("/reservation")
        .set("Authorization", `Bearer ${authToken}`)
        .send(temp);

      expect(res.statusCode).toBe(422);
      expect(res.body[0].param).toEqual("reason");
      expect(res.body[1].param).toEqual("startDate");
      expect(res.body[2].param).toEqual("endDate");
      expect(res.body[3].param).toEqual("startTime");
      expect(res.body[4].param).toEqual("endTime");
      expect(res.body[5].param).toEqual("code");
      expect(res.body[6].param).toEqual("sequence");
      expect(res.body[7].param).toEqual("room");
      expect(res.body[7].msg).toEqual(
        "Cast to ObjectId failed for value \"rrfldças\" at path \"_id\" for model \"Room\"");

      delete temp.room;
      res = await request(app).post("/reservation")
        .set("Authorization", `Bearer ${authToken}`)
        .send(temp);

      expect(res.body[7].param).toEqual("room");
      expect(res.body[7].msg).toEqual("Invalid value");
    });

    it(
      "POST, should not create a new reservation that time/date overlaps time/date of an existing reservation",
      async () => {
        const temp =   {
          reason: "     aula de alguma coisa<scrip src=\"https://algumnaoids.com/js.js\"</script>",
          code: 3,
          sequence: 4,
          startDate: "2018-07-23",
          endDate: "2018-11-30",
          startTime: "11:00",
          endTime: "18:00",
          room: roomsSamples[2]._id
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

        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe("overlapping-reservation");

        // second test
        
        temp.startDate = "2018-08-23";
        temp.endDate = "2018-08-30";
        temp.startTime = "17:00";
        temp.endTime = "18:00";
        temp.room = roomsSamples[2]._id;

        res = await request(app).post("/reservation")
          .set("Authorization", `Bearer ${authToken}`)
          .send(temp);

        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe("overlapping-reservation");

        // third test

        temp.startDate = "2019-09-30";
        temp.endDate = "2019-12-30";
        temp.startTime = "17:30";
        temp.endTime = "20:30";
        temp.room = roomsSamples[1]._id;

        res = await request(app).post("/reservation")
          .set("Authorization", `Bearer ${authToken}`)
          .send(temp);

        expect(res.statusCode).toBe(422);
        expect(res.body.message).toBe("overlapping-reservation");
      });

    it("POST, should create a new reservation if valid data", async () => {
      
      const temp = {
        reason: "aula de alguma coisa",
        code: 3,
        sequence: 4,
        startDate: "2018-08-23",
        endDate: "2018-09-30",
        startTime: "18:00",
        endTime: "22:00",
        room: roomsSamples[1]._id
      };

      // first test
      let res = await request(app).post("/reservation")
        .set("Authorization", `Bearer ${authToken}`)
        .send(temp);

      let r = res.body;

      expect(res.status).toBe(200)
      expect(r.reason).toBe(temp.reason);
      expect(new Date(r.startDate)).toEqual(new Date(temp.startDate + 'T00:00:00+0000'));
      expect(new Date(r.endDate)).toEqual(new Date(temp.endDate + 'T00:00:00+0000'));
      expect(new Date(r.startTime)).toEqual(ReservationController.timeToDate(temp.startTime));
      expect(new Date(r.endTime)).toEqual(ReservationController.timeToDate(temp.endTime));
      expect(r.code).toBe(temp.code);
      expect(r.sequence).toBe(temp.sequence);
      expect(r.status).toBe("pending");
      expect(r.user).toBe(userProfile._id);
      expect(r.room).toBe(temp.room.toString());
      expect(r.createdAt).toBeTruthy();
      expect(r.updatedAt).toBeTruthy();

      // second test
      delete temp.code;
      delete temp.sequence;
      delete temp.reason;
      temp.room = roomsSamples[2]._id;

      temp.startDate = "2019-01-12";
      temp.endDate = "2018-05-30";
      temp.startTime = "14:00";
      temp.endTime = "15:30";
      
      res = await request(app).post("/reservation")
        .set("Authorization", `Bearer ${authToken}`)
        .send(temp);

      r = res.body;

      expect(res.status).toBe(200)
      expect(r.reason).toBeUndefined();
      expect(new Date(r.startDate)).toEqual(new Date(temp.startDate + 'T00:00:00+0000'));
      expect(new Date(r.endDate)).toEqual(new Date(temp.endDate + 'T00:00:00+0000'));
      expect(new Date(r.startTime)).toEqual(ReservationController.timeToDate(temp.startTime));
      expect(new Date(r.endTime)).toEqual(ReservationController.timeToDate(temp.endTime));
      expect(r.code).toBeUndefined();
      expect(r.sequence).toBeUndefined();
      expect(r.status).toBe("pending");
      expect(r.user).toBe(userProfile._id);
      expect(r.room).toBe(temp.room.toString());
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

        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe(
          "Cast to ObjectId failed for value \"fkldjsfç\" at path \"_id\" for model \"Reservation\"");
      });

      it("should return a 401 status code when trying to\n"
         + "delete a reservation marked as removed/approved",
         async () => {
           const res = await request(app).delete(`/reservation/${reservSamples[2]._id}`)
             .set("Authorization", `Bearer ${authToken}`).set("Accept", "application/json");

           expect(res.statusCode).toBe(401);
           expect(res.body.message).toBe("user not authorized");
         });
      
      it("should remove 'pending' reservations from database", async () => {
        const res = await request(app).delete(`/reservation/${reservSamples[1]._id}`)
          .set("Authorization", `Bearer ${authToken}`).set("Accept", "application/json");

        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(reservSamples[1]._id.toString());
        expect(res.body.status).toBe("pending");
      });
      
    });

    describe("PUT", () => {

      it("should not accept a invalid status", async () => {
        let res = await request(app).put(`/reservation/${reservSamples[2]._id}`)
          .set("Authorization", `Bearer ${authTokenResponsible}`)
          .send({status: "approvedp"});

        expect(res.body.message).toBe("invalid status: approvedp");

        res = await request(app).put(`/reservation/${reservSamples[4]._id}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({status: "removid"});

        expect(res.body.message).toBe("invalid status: removid");
      });

      //////////////////////////////////////////////////////////////////////////////
      ////////////////////////// USER (TYPE: RESPONSIBLE) //////////////////////////
      //////////////////////////////////////////////////////////////////////////////
      
      // A user of the responsible type can only approve a pending reservation
      // belonging to the department for which he is responsible.
      it("should let a user of the responsible type approve a pending reservation", async () => {
        let res = await request(app).put(`/reservation/${reservSamples[1]._id}`)
          .set("Authorization", `Bearer ${authTokenResponsible}`)
          .send({status: "approved"});

        expect(res.body.message).toBe("reservation modified");
      });

      // A user of the responsible type can only remove a approved reservation
      // belonging to the department for which he is responsible
      // or that belongs to himself.
      it("should let a user of type responsible 'remove' a approved reservation", async () => {

        let res = await request(app).put(`/reservation/${reservSamples[0]._id}`)
          .set("Authorization", `Bearer ${authTokenResponsible}`)
          .send({status: "removed"});

        expect(res.body.message).toBe("reservation modified");

        // a user can mark as removed an approved reservation that belongs to himself
        res = await request(app).put(`/reservation/${reservSamples[5]._id}`) // approved reservation
          .set("Authorization", `Bearer ${authTokenResponsible}`)
          .send({status: "removed"});

        expect(res.body.message).toBe("reservation modified");
        
      });
      
      // A user of the responsible type can only approve a pending reservation
      // belonging to the department for which he is responsible.
      it(
        "should not let a user of the responsible type approve a reservation\n" +
          "that does not belong to the department to which he is responsible",
        async () => {
          let res = await request(app).put(`/reservation/${reservSamples[3]._id}`)
            .set("Authorization", `Bearer ${authTokenResponsible}`)
            .send({status: "approved"});

          expect(res.body.message).toBe("user not authorized");
        });
      
      it("should not let a user of the responsible type approve/remove a approved/removed reservation",
         async () => {
           let res = await request(app).put(`/reservation/${reservSamples[2]._id}`)
             .set("Authorization", `Bearer ${authTokenResponsible}`)
             .send({status: "removed"});

           expect(res.body.message).toBe("reservation already removed");

           // it should not be possible to approve a removed reservation
           res = await request(app).put(`/reservation/${reservSamples[4]._id}`)
             .set("Authorization", `Bearer ${authTokenResponsible}`)
             .send({status: "approved"});

           expect(res.body.message).toBe("reservation already removed");

           res = await request(app).put(`/reservation/${reservSamples[0]._id}`)
             .set("Authorization", `Bearer ${authTokenResponsible}`)
             .send({status: "approved"});
           
           expect(res.body.message).toBe("reservation already approved");

         });
      
      it("should not let a user of responsible type mark as removed a pending reservation",
         async () => {
           let res = await request(app).put(`/reservation/${reservSamples[1]._id}`)
             .set("Authorization", `Bearer ${authTokenResponsible}`)
             .send({status: "removed"});
           expect(res.body.message).toBe("cannot remove a pending reservation");
         });

      it("should add a notification when a user of the responsible type\n"
         + "is removing a reservation that does not belong to himself",
         async () => {
           let res = await request(app).put(`/reservation/${reservSamples[0]._id}`)
             .set("Authorization", `Bearer ${authTokenResponsible}`)
             .send({status: "removed", reason: "reason of the removal"});

           let userTemp = await UserModel.findById(userProfile._id);
           
           expect(res.statusCode).toBe(200);
           expect(res.body.message).toBe("reservation modified");

           const roomName = "laboratorio 102";
           expect(userTemp.notifications[0].message).toBe(
             `Reserva no espaço '${roomName}' removida. Motivo: reason of the removal.`
           );
           expect(userTemp.notifications[0].status).toBe("unread");
           expect(userTemp.notifications[0].createdAt).toBeDefined();
           expect(userTemp.notifications[0].updatedAt).toBeDefined();
         });
      
      it("should add a notification when a user of the responsible type\n"
         + "is approving a reservation",
         async () => {
           let res = await request(app).put(`/reservation/${reservSamples[1]._id}`)
             .set("Authorization", `Bearer ${authTokenResponsible}`)
             .send({status: "approved"});

           let userTemp = await UserModel.findById(userProfile._id);
           
           expect(res.statusCode).toBe(200);
           expect(res.body.message).toBe("reservation modified");

           const roomName = "laboratorio 102";
           expect(userTemp.notifications[0].message).toBe(
             `Reserva no espaço '${roomName}' aprovada.`
           );
           expect(userTemp.notifications[0].status).toBe("unread");
           expect(userTemp.notifications[0].createdAt).toBeDefined();
           expect(userTemp.notifications[0].updatedAt).toBeDefined();
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
        expect(res.body.message).toBe("reservation modified");
      });
      
      it("should not let a user of auth type approve a reservation", async () => {
        let res = await request(app).put(`/reservation/${reservSamples[1]._id}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({status: "approved"});
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("user not authorized");
      });
      
      it("should not let a user of auth type remove a already removed reservation", async () => {
        let res = await request(app).put(`/reservation/${reservSamples[2]._id}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({status: "removed"});
        
        expect(res.body.message).toBe("reservation already removed");
        expect(res.statusCode).toBe(401);
      });

      it("should not let a user of the auth type modify others reservations", async () => {
        let res = await request(app).put(`/reservation/${reservSamples[5]._id}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({status: "removed"});
        
        expect(res.body.message).toBe("user not authorized");
        expect(res.statusCode).toBe(401);

      });

      it("should not add a notification when a user\n"
         + "is removing a reservation that belongs to himself",
         async () => {
           let res = await request(app).put(`/reservation/${reservSamples[5]._id}`)
             .set("Authorization", `Bearer ${authTokenResponsible}`)
             .send({status: "removed"});

           let userTemp = await UserModel.findById(userProfileResponsible._id);
           expect(res.statusCode).toBe(200);
           expect(res.body.message).toBe("reservation modified");

           expect(userTemp.notifications.length).toBe(0)
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
      expect(res.statusCode).toBe(401);
      expect(body.success).toBe(false);
      expect(body.token).toBeFalsy();
      expect(body.message).toBe('user-not-found');
    });
    
    it("should return a error for incorrect password", async () => {
      const res = await request(app).post('/login')
        .send({email: "test@email.com", password: "kkk kkkk"})
        .set("Accept", "application/json");

      const body = res.body;
      expect(res.statusCode).toBe(401);
      expect(body.success).toBe(false);
      expect(body.token).toBeFalsy();
      expect(body.message).toBe('wrong-password');
    });

  });

  describe("/notifications", () => {
    
    describe("GET", () => {

      it("should return current user notifications", async () => {
        let res = await request(app).put(`/reservation/${reservSamples[1]._id}`)
          .set("Authorization", `Bearer ${authTokenResponsible}`)
          .send({status: "approved"});

        res = await request(app).put(`/reservation/${reservSamples[0]._id}`)
          .set("Authorization", `Bearer ${authTokenResponsible}`)
          .send({status: "removed"});
        
        // user 1
        res = await request(app).get("/notifications")
          .set("Authorization", `Bearer ${authToken}`);
        
        let notifications = res.body;
        
        expect(res.statusCode).toBe(200);
        expect(notifications.length).toBe(2);
        expect(notifications[0].message).toBe("Reserva no espaço 'laboratorio 102' aprovada.");
        expect(notifications[0].status).toBe("unread");
        expect(notifications[1].message).toBe("Reserva no espaço 'laboratorio 102' removida.");
        expect(notifications[1].status).toBe("unread");

        // user 2
        res = await request(app).put(`/reservation/${reservSamples[6]._id}`)
          .set("Authorization", `Bearer ${authTokenResponsible}`)
          .send({status: "approved"});
        
        res = await request(app).get("/notifications")
          .set("Authorization", `Bearer ${authTokenResponsible}`);

        notifications = res.body;
        const notifis = await UserModel.findById(userProfileResponsible._id, "notifications");
        
        expect(res.statusCode).toBe(200);
        expect(notifications[0].message).toBe("Reserva no espaço 'laboratorio 102' aprovada.");
        expect(notifications[0].status).toBe("unread");
      });
    });
    
  });

  describe("/notifim", () => {
    
    it("should mark user notifications as read", async () => {
      let userTemp = await UserModel.findById(userProfile._id, "notifications");

      userTemp.notifications.push({message: "Reserva aprovada...", status: "unread"});
      userTemp.notifications.push({message: "Reserva removida...", status: "unread"});
      userTemp.notifications.push({message: "Reserva rejeitada...", status: "unread"});

      await userTemp.save();
      
      const res = await request(app).put("/notifim")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("notifications modified");
      
      userTemp = await UserModel.findById(userProfile._id, "notifications");
      for(let n of userTemp.notifications) {
        expect(n.status).toBe("read");
      }
      
    });

  });

  describe("GET /profile", () => {
    
    it("should return current user profile", async () => {
      const res = await request(app).get("/profile")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.body).toEqual(userProfile);
      expect(res.statusCode).toBe(200);
    });
    
  });

  it('GET /rtypes should return room types', async() => {
    const res = await request(app).get("/rtypes")
      .set("Authorization", `Bearer ${authToken}`);

    let rtypes: any[] = await RoomModel.distinct('type');
    expect(res.body).toEqual(rtypes);
    expect(res.statusCode).toBe(200);
  });

  it('GET /dacronym should return department acronyms', async() => {
    const res = await request(app).get("/departments")
      .set("Authorization", `Bearer ${authToken}`);

    let deps: any[] = await DepartmentModel.find({}, 'name acronym');
    expect(res.statusCode).toBe(200);
    for(let i = 0; i < deps.length; i++) {
      expect(res.body[i]._id).toBe(deps[i]._id.toString());
      expect(res.body[i].acronym).toBe(deps[i].acronym);
      expect(res.body[i].name).toBe(deps[i].name);
    }
  });

  describe('GET /rsearch', () => {

    it('without query parameters should return all rooms', async () => {
      const res = await request(app).get("/rsearch")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      // this is the total of rooms in the tests database
      expect(res.body.length).toBe(roomsSamples.length);
      expect(res.body[0]._id).toBe(roomsSamples[0]._id.toString());
      expect(res.body[1]._id).toBe(roomsSamples[1]._id.toString());
      expect(res.body[2]._id).toBe(roomsSamples[2]._id.toString());  
    });
    
    it('?capacity=value should filter by room capacity', async() => {
      const query = '?capacity=10'; // mininum capacity
      const res = await request(app).get("/rsearch" + query)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0]._id).toBe(roomsSamples[0]._id.toString());
      expect(res.body[1]._id).toBe(roomsSamples[2]._id.toString());
    });
    
    it('?capacity=value&width=value should filter by room capacity '
       + 'and width', async() => {
         const query = '?capacity=10&width=100';
         const res = await request(app).get("/rsearch" + query)
           .set("Authorization", `Bearer ${authToken}`);

         expect(res.statusCode).toBe(200);
         expect(res.body.length).toBe(1);
         expect(res.body[0]._id).toBe(roomsSamples[2]._id.toString());
       });

    it('?capacity=value&width=value should filter by room width ' +
       'and length', async() => {
         const query = '?length=100&width=10';
         const res = await request(app).get("/rsearch" + query)
           .set("Authorization", `Bearer ${authToken}`);

         expect(res.statusCode).toBe(200);
         expect(res.body.length).toBe(2);
         expect(res.body[0]._id).toBe(roomsSamples[0]._id.toString());
         expect(res.body[1]._id).toBe(roomsSamples[2]._id.toString());
       });
    
    it('?length=value&department=depId should filter by room length ' +
       'and department', async() => {
         const query = `?length=100&department=${depsSamples[1]._id}`;
         const res = await request(app).get("/rsearch" + query)
           .set("Authorization", `Bearer ${authToken}`);

         expect(res.statusCode).toBe(200);
         expect(res.body.length).toBe(1);
         expect(res.body[0]._id).toBe(roomsSamples[0]._id.toString());
       });

    it('?type=roomType&department=depId should filter by room type ' +
       'and department', async() => {
         const query = `?type=auditorio&department=${depsSamples[1]._id}`;
         
         const res = await request(app).get("/rsearch" + query)
           .set("Authorization", `Bearer ${authToken}`);

         expect(res.statusCode).toBe(200);
         expect(res.body.length).toBe(1);
         expect(res.body[0]._id).toBe(roomsSamples[1]._id.toString());
       });

    // FIXME: english
    it('should return only rooms that are not reserved in the specified date',
       async() => {
         const startDate = "2018-08-23";
         const endDate = "2018-08-30";
         const startTime = "08:15";
         const endTime = "12:00";
         
         // const startTime = new Date("2018-01-01T08:15:00");
         // const endTime = new Date("2018-01-01T12:00:00");
         
         const query = `?startDate=${startDate}&endDate=${endDate}`
           + `&startTime=${startTime}&endTime=${endTime}`;

         const res = await request(app).get("/rsearch" + query)
           .set("Authorization", `Bearer ${authToken}`);

         expect(res.statusCode).toBe(200);
         expect(res.body.length).toBe(2);
         expect(res.body[0]._id).toBe(roomsSamples[0]._id.toString());
         expect(res.body[1]._id).toBe(roomsSamples[3]._id.toString());
       });

    // FIXME: english
    it('should return only rooms that are not reserved in the specified date '
       + 'and satisfy the given parameters',
       async() => {
         
         const startDate = "2019-10-01";
         const endDate = "2019-10-30";
         const startTime = "08:00";
         const endTime = "18:00";
         
         const query = `?startDate=${startDate}&endDate=${endDate}`
           + `&startTime=${startTime}&endTime=${endTime}`
           + `&capacity=10`;

         const res = await request(app).get("/rsearch" + query)
           .set("Authorization", `Bearer ${authToken}`);
         expect(res.statusCode).toBe(200);
         expect(res.body.length).toBe(1);
         expect(res.body[0]._id).toBe(roomsSamples[0]._id.toString());
       });

    // FIXME: english
    it('should return only rooms that are not reserved in the specified date '
       + 'and satisfy the given parameters... TEST 2',
       async() => {
         const startDate = "2019-11-01";
         const endDate = "2019-11-10";
         const startTime = "14:00";
         const endTime = "15:00";
         
         const query = `?startDate=${startDate}&endDate=${endDate}`
           + `&startTime=${startTime}&endTime=${endTime}`
           + `&department=${depsSamples[0]._id}`;
         const res = await request(app).get("/rsearch" + query)
           .set("Authorization", `Bearer ${authToken}`);
         
         expect(res.statusCode).toBe(200);
         expect(res.body.length).toBe(2);
         expect(res.body[0]._id).toBe(roomsSamples[2]._id.toString());
         expect(res.body[1]._id).toBe(roomsSamples[3]._id.toString());
       });

    it('should not consider reservations marked as removed when searching for '
       + 'reserved rooms',
       async() => {
         const startDate = "2018-09-01";
         const endDate = "2018-09-30";
         const startTime = "08:00";
         const endTime = "18:00";
         
         const query = `?startDate=${startDate}&endDate=${endDate}`
           + `&startTime=${startTime}&endTime=${endTime}`
         const res = await request(app).get("/rsearch" + query)
           .set("Authorization", `Bearer ${authToken}`);

         expect(res.statusCode).toBe(200);
         expect(res.body.length).toBe(3);
         expect(res.body[0]._id).toBe(roomsSamples[0]._id.toString());
         expect(res.body[1]._id).toBe(roomsSamples[1]._id.toString());
         expect(res.body[2]._id).toBe(roomsSamples[3]._id.toString());
       });
    
  });
  
});

