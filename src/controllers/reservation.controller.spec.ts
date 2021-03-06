import { Response, Request } from 'express';

import { ReservationController } from './reservation.controller';
import { ReservationModel } from './../models/reservation.model';
import { RoomModel } from './../models/room.model';
import { DepartmentModel } from './../models/department.model';
import { UserModel } from './../models/user.model';

jest.mock('./../models/reservation.model', () => {
  return {
    ReservationModel: jest.fn()
  }
});

jest.mock('./../models/room.model', () => {
  return {
    RoomModel: jest.fn()
  }
});

jest.mock('./../models/department.model', () => {
  return {
    DepartmentModel: jest.fn()
  }
});

jest.mock('./../models/user.model', () => {
  return {
    UserModel: jest.fn()
  }
});

// ReservationModel.find = jest.fn((query, callback) => { callback(null, {status: "pending"})});
ReservationModel.find = jest.fn();
ReservationModel.populate = jest.fn();
ReservationModel.populate.mockReturnValue(ReservationModel);
ReservationModel.find.mockReturnValue(ReservationModel);

import * as validator from "express-validator/check";

jest.mock("express-validator/check");

describe("ReservationController", () => {

  let instance: ReservationController;

  let Req = jest.fn<Request>().mockImplementation(() => {
    return {
      user: { sub: "userid" }
    };
  });
  
  let Res = jest.fn<Response>().mockImplementation(() => {
    return {
      send: jest.fn()
    };
  });
  
  beforeEach(() => {
    instance = new ReservationController();
  });
  
  it("#getReservation?status=approved should return the approved reservations",
     () => {
    let req = new Req();
    let res = new Res();

    const reservsStub = [{_id: 'reserv01'}, {_id: 'reserv02'}];
    ReservationModel.exec = jest.fn((callback) => callback(null, reservsStub));
    
    req.query = {status: "approved"};
    
    instance.getReservations(req, res);
    
    expect(ReservationModel.find).toHaveBeenCalledTimes(1);
    expect(ReservationModel.find).toBeCalledWith({user: "userid", status: "approved"});

       expect(ReservationModel.populate).toHaveBeenCalledTimes(1);
       expect(ReservationModel.populate).toHaveBeenCalledWith(
         {path: 'room', populate: {path: 'department'}});
       
       expect(res.send).toHaveBeenCalledTimes(1);
       expect(res.send).toHaveBeenCalledWith(reservsStub);
     });

  it("#getReservations() should return pending reservs when status=pending", () => {
    let req = new Req();
    let res = new Res();
    req.query = {status: "pending"};

    const resvsStub = [{_id: 're01'}, {_id: 're02'}];
    ReservationModel.exec = jest.fn((callback) => callback(null, resvsStub));
    instance.getReservations(req, res);
    
    expect(ReservationModel.find).toHaveBeenCalledTimes(1);
    expect(ReservationModel.find).toHaveBeenCalledWith({user: "userid", status: "pending"});

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(resvsStub);
  });

  it('#getReservations() should return a list of pending reservations by department '
     + 'when req.query.by === "dep"', () => {
       let req = new Req();
       let res = new Res();
       req.query = {status: "pending", by: 'dep'};
       (req as any).user.dep = 'dep001';

       const resvsStub = [{_id: 're01'}, {_id: 're02'}];
       ReservationModel.exec = jest.fn((callback) => callback(null, resvsStub));
       ReservationModel.byStatusAndDep = jest.fn(() => ReservationModel);

       instance.getReservations(req, res);

       expect(ReservationModel.find).toHaveBeenCalledTimes(1);
       expect(ReservationModel.find).toHaveBeenCalledWith();
       expect(ReservationModel.byStatusAndDep).toHaveBeenCalledTimes(1);
       expect(ReservationModel.byStatusAndDep).toHaveBeenCalledWith(
         req.query.status, (req as any).user.dep);
       expect(res.send).toHaveBeenCalledTimes(1);
       expect(res.send).toHaveBeenCalledWith(resvsStub);
     });

  it('#getReservations() -- req.query = {status: \'pending\', op: \'count\'} -- '
     + 'should return the number of pending reservations of the current user', () => {
       let req = new Req();
       let res = new Res();
       req.query = {status: "pending", op: 'count'};
       res.json = jest.fn();

       const countStub = 3;
       ReservationModel.countDocuments = jest.fn(() => ReservationModel);
       ReservationModel.exec = jest.fn((callback) => callback(null, countStub));
       instance.getReservations(req, res);

       expect(ReservationModel.countDocuments).toHaveBeenCalledTimes(1);
       expect(ReservationModel.countDocuments).toHaveBeenCalledWith({user: "userid", status: "pending"});

       expect(res.json).toHaveBeenCalledTimes(1);
       expect(res.json).toHaveBeenCalledWith(countStub);
     });

  it('#getReservations() -- req.query = {status: \'pending\', op: \'countdep\'} -- '
     + '\nshould return the number of pending reservations by department', () => {
       let req = new Req();
       let res = new Res();
       req.query = {status: "pending", op: 'countdep'};
       res.json = jest.fn();
       (req as any).user.dep = 'dep001';

       const countStub = [{n: 3}];
       ReservationModel.countDocuments = jest.fn(() => ReservationModel);
       ReservationModel.countByStatusAndDep = jest.fn(() => ReservationModel);
       ReservationModel.exec = jest.fn((callback) => callback(null, countStub));
       instance.getReservations(req, res);

       expect(ReservationModel.countDocuments).toHaveBeenCalledTimes(1);
       expect(ReservationModel.countDocuments).toHaveBeenCalledWith();

       expect(ReservationModel.countByStatusAndDep).toHaveBeenCalledTimes(1);
       expect(ReservationModel.countByStatusAndDep).toHaveBeenCalledWith(
         req.query.status, (req as any).user.dep);

       expect(res.json).toHaveBeenCalledTimes(1);
       expect(res.json).toHaveBeenCalledWith(countStub[0].n);
     });

  it("#getReservations() should search for removed reservs when status=removed", () => {
    let req = new Req();
    let res = new Res();
    req.query = {status: "removed"};
    
    const resvsStub = [{_id: 're01'}, {_id: 're02'}];
    ReservationModel.exec = jest.fn((callback) => callback(null, resvsStub));
    
    instance.getReservations(req, res);
    
    expect(ReservationModel.find).toHaveBeenCalledTimes(1);
    expect(ReservationModel.find).toHaveBeenCalledWith({user: "userid", status: "removed"});
                                    
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(resvsStub);
  });

  it("#deleteReservation#/:id should remove pending reservations from database", () => {
    let req = new Req();
    let res = new Res();
    req.params = {id: "ddd1"}

    const temp = {
      status: "pending",
      remove: jest.fn()
    };
    
    ReservationModel.findOne = jest.fn((query, callback) => callback(null, temp));
    
    instance.deleteReservation(req, res);
    
    expect(ReservationModel.findOne).toHaveBeenCalledTimes(1);
    expect(ReservationModel.findOne).toHaveBeenCalledWith({_id: "ddd1", user: "userid"},
                                                          expect.any(Function));

    expect(temp.remove).toHaveBeenCalledTimes(1);
  });

  it("#newReservation() should create a new pending reservation and save it in the database", () => {
    let req = new Req();
    let res = new Res();

    const newReservStubData: any = {
      reason: "alguma coisa",
      startDate: '2018-11-01',
      endDate: '2018-11-11',
      startTime: '08:00',
      endTime: '12:00',
      code: 22,
      sequence: 1,
      room: "roomId01"
    };

    const newReservStubExpected: any = {
      reason: 'alguma coisa',
      startDate: '2018-11-01T00:00:00+0000',
      endDate: '2018-11-11T00:00:00+0000',
      startTime: ReservationController.timeToDate('08:00'),
      endTime: ReservationController.timeToDate('12:00'),
      code: 22,
      sequence: 1,
      room: 'roomId01',
      status: 'pending',
      user: (req as any).user.sub
    };
    
    req.body = newReservStubData;

    const mockFindOverlappingReservation = jest.fn((callback) => {
      callback(null, []);
    });

    const mockSave = jest.fn((callback) => {
      callback(null, newReservStubData);
    });
    
    ReservationModel.mockImplementation(() => {
      return {
        findOverlappingReservations: mockFindOverlappingReservation,
        save: mockSave
      };
    });
    
    instance.newReservation(req, res);

    newReservStubData.user = (req as any).user.sub;
    newReservStubData.status = "pending";
    
    expect(ReservationModel).toHaveBeenCalledTimes(1);
    expect(ReservationModel).toHaveBeenCalledWith(newReservStubExpected);
    expect(mockFindOverlappingReservation).toHaveBeenCalledTimes(1);
    expect(mockFindOverlappingReservation).toHaveBeenCalledWith(expect.any(Function));

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith(expect.any(Function));

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(newReservStubData);
  });

  it('#newReservation() should not create a new reservation '
     + 'if it conflits with an existing reservation', () => {

      let req = new Req();
      let res = new Res();

       res.status = jest.fn();
       (res.status as any).mockReturnValue(res);

       const newReservStubData: any = {
         reason: "blud",
         code: '0',
         sequence: '0',
         startDate: '2018-11-02',
         endDate: '2018-11-02',
         startTime: '01:00',
         endTime: '04:00',
         room: "roomId01"
       };

       const newReservStubExpected: any = {
         reason: "blud",
         code: '0',
         sequence: '0',
         startDate: '2018-11-02T00:00:00+0000',
         endDate: '2018-11-02T00:00:00+0000',
         startTime: ReservationController.timeToDate('01:00'),
         endTime: ReservationController.timeToDate('04:00'),
         room: "roomId01",
         user: (req as any).user.sub,
         status: 'pending'
       };
      
      req.body = newReservStubData;

      const mockFindOverlappingReservation = jest.fn((callback) => {
        callback(null, [{room: "room11"}]);
      });

      const mockSave = jest.fn((callback) => {
        callback(null, newReservStubData);
      });
      
      ReservationModel.mockImplementation(() => {
        return {
          findOverlappingReservations: mockFindOverlappingReservation,
          save: mockSave
        };
      });
      
      instance.newReservation(req, res);

      expect(ReservationModel).toHaveBeenCalledTimes(1);
      expect(ReservationModel).toHaveBeenCalledWith(newReservStubExpected);
      expect(mockFindOverlappingReservation).toHaveBeenCalledTimes(1);
      expect(mockFindOverlappingReservation).toHaveBeenCalledWith(expect.any(Function));

      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith({message: "overlapping-reservation"});
    }
  );
  
  it("#validateNew() should validate incoming reservation data", () => {
    
    const stubData = {
      req: {
        body: {
          room: "roomid000"
        }
      }
    };

    RoomModel.countDocuments = jest.fn();
    
    const mockCustom = jest.fn((callback) => callback(true, stubData));
    const mockEscape = jest.fn();
    const mockTrim = jest.fn(() => {return{escape: mockEscape}});
    const mockIsEmpty = jest.fn(() => {return{trim: mockTrim}});
    const mockNot = jest.fn(() => {return{isEmpty: mockIsEmpty}});
    const mockIsString = jest.fn(() => {return{not: mockNot, custom: mockCustom}});
    const mockIsInt = jest.fn();
    const mockOptional = jest.fn(() => {return{isString: mockIsString, isInt: mockIsInt}});
    const mockIsISO8601 = jest.fn();
    const mockMatches = jest.fn();
    const mockBody = jest.fn(() => {return {optional: mockOptional, isISO8601: mockIsISO8601, isString: mockIsString, matches: mockMatches}});
    (validator as any).body = mockBody;
    instance.validateNew();

    expect(RoomModel.countDocuments).toHaveBeenCalledTimes(1);
    expect(RoomModel.countDocuments).toHaveBeenCalledWith({_id: stubData.req.body.room}, expect.any(Function));

    expect(mockBody).toHaveBeenCalledTimes(8);
    expect(mockBody).toHaveBeenCalledWith("reason");
    expect(mockBody).toHaveBeenCalledWith("startDate");
    expect(mockBody).toHaveBeenCalledWith("endDate");
    expect(mockBody).toHaveBeenCalledWith("startTime");
    expect(mockBody).toHaveBeenCalledWith("startTime");
    expect(mockBody).toHaveBeenCalledWith("code");
    expect(mockBody).toHaveBeenCalledWith("sequence");
    expect(mockBody).toHaveBeenCalledWith("room");

    expect(mockOptional).toHaveBeenCalledTimes(3);
    expect(mockIsString).toHaveBeenCalledTimes(2);
    expect(mockNot).toHaveBeenCalledTimes(1);
    expect(mockIsEmpty).toHaveBeenCalledTimes(1);
    expect(mockTrim).toHaveBeenCalledTimes(1);
    expect(mockEscape).toHaveBeenCalledTimes(1);
    expect(mockIsISO8601).toHaveBeenCalledTimes(2);
    expect(mockMatches).toHaveBeenCalledTimes(2);
    expect(mockIsInt).toHaveBeenCalledTimes(2);
    expect(mockIsInt).toHaveBeenCalledWith({min: 0});
    expect(mockCustom).toHaveBeenCalledTimes(1);
    expect(mockCustom).toHaveBeenCalledWith(expect.any(Function));
    
  });

  it("#checkRoomExistence() should resolve to true if the room is found", async () => {
    
    const stubData = {
      req: {
        body: {
          room: "roomid001"
        }
      }
    };

    expect.assertions(3);

    RoomModel.countDocuments = jest.fn((value, callback) => callback(null, 1));
    
    const result = await instance.checkRoomExistence(true, stubData);
    expect(RoomModel.countDocuments).toHaveBeenCalledTimes(1);
    expect(RoomModel.countDocuments).toHaveBeenCalledWith(
      {_id: stubData.req.body.room}, expect.any(Function)
    );
    expect(result).toBe(true);
  });
  
  it("#checkRoomExistence() should reject if the room is not found", async () => {
    
    const stubData = {
      req: {
        body: {
          room: "roomid001"
        }
      }
    };

    expect.assertions(3);
    RoomModel.countDocuments = jest.fn((value, callback) => callback(null, 0));

    await expect(instance.checkRoomExistence(true, stubData))
      .rejects.toBe(`Room with id ${stubData.req.body.room} not found`);
    expect(RoomModel.countDocuments).toHaveBeenCalledTimes(1);
    expect(RoomModel.countDocuments).toHaveBeenCalledWith(
      {_id: stubData.req.body.room}, expect.any(Function)
    );
  });

  it("#updateReservation() should update a reservation", () => {
    let req = new Req();
    let res = new Res();

    req.body = {status: "approved"};
    const reservStub = {_id: "reservid", user: "userId001", status: "approved"};
    (req as any).reserv = reservStub;
    ReservationModel.findByIdAndUpdate = jest.fn(
      (arg1, arg2, options, callback) => callback(null, reservStub)
    );

    const mockSave = jest.fn((callback) => callback(null));
    const userStub = {notifications: [], save: mockSave};
    
    UserModel.findById = jest.fn((id, callback) => callback(null, userStub));

    const roomStub = {name: "roomname"};
    RoomModel.findById = jest.fn((id, projection, callback) => {
      callback(null, roomStub);
    });
    
    instance.updateReservation(req, res);

    expect(ReservationModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(ReservationModel.findByIdAndUpdate).toHaveBeenCalledWith(
      {_id: "reservid"}, {status: "approved"}, {new: true}, expect.any(Function));
    
    expect(UserModel.findById).toHaveBeenCalledTimes(1);
    expect(UserModel.findById).toHaveBeenCalledWith(reservStub.user, expect.any(Function));
    expect(userStub.notifications.length).toBe(1);
    expect(userStub.notifications[0]).toEqual(
      {message: `Reserva no espaço '${roomStub.name}' aprovada.`, status: "unread"});
    expect(userStub.save).toHaveBeenCalledTimes(1);
    expect(userStub.save).toHaveBeenCalledWith(expect.any(Function));
    
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(reservStub);
  });

  it("#validateUpdate() should not accept invalid status", () => {
    let req = new Req();
    let res = new Res();

    req.body = {
      status: "pending"
    };

    res.status = jest.fn();
    (res.status as any).mockReturnValue(res);

    const mockNext = jest.fn();
    
    instance.validateUpdate(req, res, mockNext);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({message: "invalid status: pending"});
  });

  it("#validateUpdate() should let a user of the auth type remove " + 
     "an approved reservation that belongs to himself", () => {
       let req = new Req();
       let res = new Res();

       req.body = {
         status: "removed"
       };

       req.params = {id: "reservid"};

       (req as any).user = {
         sub: "userid001",
         role: "auth"
       }

       ReservationModel.findById = jest.fn((id, callback) => callback(null, {user: "userid001", status: "approved"}));
       const mockNext = jest.fn();
       
       instance.validateUpdate(req, res, mockNext);

       expect(ReservationModel.findById).toHaveBeenCalledTimes(1);
       expect(ReservationModel.findById).toHaveBeenCalledWith("reservid", expect.any(Function));
       expect(mockNext).toHaveBeenCalledTimes(1);
       expect(mockNext).toHaveBeenCalledWith();
     });

  it("#validateUpdate() should not let a user of the auth type update " +
     "a reservation that does not belong to himself", () => {
       let req = new Req();
       let res = new Res();

       req.body = {
         status: "removed"
       };

       req.params = {id: "reservid"};

       (req as any).user = {
         sub: "userid001",
         role: "auth"
       }

       res.status = jest.fn();
       (res.status as any).mockReturnValue(res);

       ReservationModel.findById = jest.fn(
         (id, callback) => callback(null, {user: "userid000", status: "approved"})
       );
       const mockNext = jest.fn();
       
       instance.validateUpdate(req, res, mockNext);

       expect(ReservationModel.findById).toHaveBeenCalledTimes(1);
       expect(ReservationModel.findById).toHaveBeenCalledWith("reservid", expect.any(Function));
       expect(mockNext).toHaveBeenCalledTimes(0);
       expect(res.status).toHaveBeenCalledTimes(1);
       expect(res.status).toHaveBeenCalledWith(401);
       expect(res.send).toHaveBeenCalledWith({message: "user not authorized"});
     });

  it("#validateUpdate() should let a user of the responsible type remove an approved " +
     "reservation that belongs to the department for which he is responsible", () => {
       let req = new Req();
       let res = new Res();

       req.body = {
         status: "removed"
       };

       req.params = {id: "reservid"};

       (req as any).user = {
         sub: "userid001",
         role: "responsible"
       }

       res.status = jest.fn();
       (res as any).status.mockReturnValue(res);

       RoomModel.findById = jest.fn(
         (id, project, callback) => callback(null, {department: "dep001"}));

       DepartmentModel.findById = jest.fn(
         (id, project, callback) => callback(null, {user: "userid001"}));
       
       ReservationModel.findById = jest.fn(
         (id, callback) => callback(null, {user: "userid000", status: "approved", room: "roomId001"})
       );
       const mockNext = jest.fn();
       
       instance.validateUpdate(req, res, mockNext);

       expect(ReservationModel.findById).toHaveBeenCalledTimes(1);
       expect(ReservationModel.findById).toHaveBeenCalledWith("reservid", expect.any(Function));
       expect(mockNext).toHaveBeenCalledTimes(1);

       expect(RoomModel.findById).toHaveBeenCalledTimes(1);
       expect(RoomModel.findById).toHaveBeenCalledWith("roomId001",
                                                       "department",
                                                       expect.any(Function));
     });

  it("#validateUpdate() should not let a user of the responsible type to remove an approved " +
     "reservation that does not belong to the department for which he is responsible", () => {
       let req = new Req();
       let res = new Res();

       req.body = {
         status: "removed"
       };

       req.params = {id: "reservid"};

       (req as any).user = {
         sub: "userid001",
         role: "responsible"
       }

       res.status = jest.fn();
       (res.status as any).mockReturnValue(res);

       RoomModel.findById = jest.fn(
         (id, project, callback) => callback(null, {department: "dep001"}));

       DepartmentModel.findById = jest.fn(
         (id, project, callback) => callback(null, {user: "userid000"}));
       
       ReservationModel.findById = jest.fn(
         (id, callback) => callback(null, {user: "userid000", status: "approved", room: "roomId001"})
       );
       const mockNext = jest.fn();
       
       instance.validateUpdate(req, res, mockNext);

       expect(ReservationModel.findById).toHaveBeenCalledTimes(1);
       expect(ReservationModel.findById).toHaveBeenCalledWith("reservid", expect.any(Function));
       expect(mockNext).toHaveBeenCalledTimes(0);

       expect(RoomModel.findById).toHaveBeenCalledTimes(1);
       expect(RoomModel.findById).toHaveBeenCalledWith("roomId001",
                                                       "department",
                                                       expect.any(Function));

       expect(res.status).toHaveBeenCalledTimes(1);
       expect(res.status).toHaveBeenCalledWith(401);
       expect(res.send).toHaveBeenCalledTimes(1);
       expect(res.send).toHaveBeenCalledWith({message: "user not authorized"});
     });

  it("#validateUpdate() should let a user of the responsible type approve a pending " +
     "reservation belonging to the department to which he is responsible", () => {
       let req = new Req();
       let res = new Res();

       req.body = {
         status: "approved"
       };

       req.params = {id: "reservid"};

       (req as any).user = {
         sub: "userid001",
         role: "responsible"
       };

       res.status = jest.fn();
       (res.status as any).mockReturnValue(res);

       RoomModel.findById = jest.fn(
         (id, project, callback) => callback(null, {department: "dep001"}));

       DepartmentModel.findById = jest.fn(
         (id, project, callback) => callback(null, {user: "userid001"}));
       
       ReservationModel.findById = jest.fn(
         (id, callback) => callback(null, {user: "userid000", status: "pending", room: "roomId001"})
       );
       const mockNext = jest.fn();
       
       instance.validateUpdate(req, res, mockNext);

       expect(ReservationModel.findById).toHaveBeenCalledTimes(1);
       expect(ReservationModel.findById).toHaveBeenCalledWith("reservid", expect.any(Function));
       expect(mockNext).toHaveBeenCalledTimes(1);

       expect(RoomModel.findById).toHaveBeenCalledTimes(1);
       expect(RoomModel.findById).toHaveBeenCalledWith("roomId001",
                                                       "department",
                                                       expect.any(Function));
     });

  it("#updateReservation() should add a notification when a user of the responsible type\n"
     + "is removing a reservation that does not belong to himself",  () => {
       const req = new Req();
       const res = new Res();

       const incomingStatus = "removed";
       req.body = {status: incomingStatus};
       
       const reservStub = {_id: "reservid001", user: "user000", status: "removed"};
       (req as any).reserv = reservStub;

       (req as any).user = {sub: "user001"};

       ReservationModel.findByIdAndUpdate = jest.fn(
         (query, newData, option, callback) => callback(null, reservStub));

       const userStub = {
         notifications: [],
         save: jest.fn((callback) => callback(null))
       };
       
       UserModel.findById = jest.fn((id, callback) => callback(null, userStub));

       const roomStub = {name: "roomname2"};
       RoomModel.findById = jest.fn(
         (query, projection, callback) => callback(null, roomStub));
       
       instance.updateReservation(req, res);
       expect(ReservationModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
       expect(ReservationModel.findByIdAndUpdate).toHaveBeenCalledWith(
         {_id: reservStub._id}, {status: incomingStatus}, {new: true}, expect.any(Function));

       expect(UserModel.findById).toHaveBeenCalledTimes(1);
       expect(UserModel.findById).toHaveBeenCalledWith(reservStub.user, expect.any(Function));

       expect(userStub.notifications[0]).toEqual(
         {message: `Reserva no espaço '${roomStub.name}' removida.`, status: "unread"});
       expect(userStub.save).toHaveBeenCalledTimes(1);
       expect(userStub.save).toHaveBeenCalledWith(expect.any(Function));

       expect(res.send).toHaveBeenCalledTimes(1);
       expect(res.send).toHaveBeenCalledWith(reservStub);

       // removing a reservation with a reason
       req.body.reason = "Motivo da remoção";
       instance.updateReservation(req, res);
       expect(userStub.notifications[1]).toBeDefined();
       expect(userStub.notifications[1]).toEqual(
         {message: `Reserva no espaço '${roomStub.name}' removida. Motivo: ${req.body.reason}.`,
          status: "unread"
         }
       );
       
     });

  it("#updateReservation() should not add a notification when a user\n"
     + "is removing a reservation that belongs to himself",  () => {
       const req = new Req();
       const res = new Res();

       const incomingStatus = "removed";
       req.body = {status: incomingStatus};
       
       const reservStub = {_id: "reservid001", user: "user000"};
       (req as any).reserv = reservStub;

       (req as any).user = {sub: "user000"};

       ReservationModel.findByIdAndUpdate = jest.fn(
         (query, newData, option, callback) => callback(null, reservStub));

       const userStub = {
         notifications: [],
         save: jest.fn((callback) => callback(null))
       };
       
       UserModel.findById = jest.fn((id, callback) => callback(null, userStub));
       
       instance.updateReservation(req, res);
       expect(ReservationModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
       expect(ReservationModel.findByIdAndUpdate).toHaveBeenCalledWith(
         {_id: reservStub._id}, {status: incomingStatus}, {new: true}, expect.any(Function));

       expect(UserModel.findById).toHaveBeenCalledTimes(0);

       expect(res.send).toHaveBeenCalledTimes(1);
       expect(res.send).toHaveBeenCalledWith(reservStub);

       expect(userStub.notifications.length).toBe(0);
       expect(userStub.save).toHaveBeenCalledTimes(0);
     });

  it("#updateReservation() should add a notification when a user of the responsible type\n"
     + "is approving a reservation",  () => {
       const req = new Req();
       const res = new Res();

       const incomingStatus = "approved";
       req.body = {status: incomingStatus};
       
       const reservStub = {_id: "reservid001", user: "user000", status: "approved"};
       (req as any).reserv = reservStub;

       (req as any).user = {sub: "user001"};

       ReservationModel.findByIdAndUpdate = jest.fn(
         (query, newData, option, callback) => callback(null, reservStub));

       const userStub = {
         notifications: [],
         save: jest.fn((callback) => callback(null))
       };
       
       UserModel.findById = jest.fn((id, callback) => callback(null, userStub));

       const roomStub = {name: "roomname3"};
       RoomModel.findById = jest.fn(
         (query, projection, callback) => callback(null, roomStub));
       
       instance.updateReservation(req, res);
       expect(ReservationModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
       expect(ReservationModel.findByIdAndUpdate).toHaveBeenCalledWith(
         {_id: reservStub._id}, {status: incomingStatus}, {new: true}, expect.any(Function));

       expect(UserModel.findById).toHaveBeenCalledTimes(1);
       expect(UserModel.findById).toHaveBeenCalledWith(reservStub.user, expect.any(Function));

       expect(userStub.notifications[0]).toEqual(
         {message: `Reserva no espaço '${roomStub.name}' aprovada.`, status: "unread"});
       expect(userStub.save).toHaveBeenCalledTimes(1);
       expect(userStub.save).toHaveBeenCalledWith(expect.any(Function));

       expect(res.send).toHaveBeenCalledTimes(1);
       expect(res.send).toHaveBeenCalledWith(reservStub);
       
     });

  it('#timeToDate() should return a date with the specified time', () => {
    const result = ReservationController.timeToDate('12:00');
    expect(result).toEqual(new Date('2018-01-01T12:00:00+0000'));
  });
  
});
