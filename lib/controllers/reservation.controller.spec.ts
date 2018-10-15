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
  
  it("#getReservation?status=approved should run", () => {
    let req = new Req();
    let res = new Res();

    ReservationModel.exec = jest.fn((callback) => callback(null, {status: "pending"}));
    
    req.query = {status: "approved"};
    
    instance.getReservations(req, res);
    
    expect(ReservationModel.find).toHaveBeenCalledTimes(1);
    expect(ReservationModel.find).toBeCalledWith({user: "userid", status: "approved"});
                                                 
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({success: true , result: {status: "pending"}});
  });

  it("#getReservations?status=pending should run", () => {
    let req = new Req();
    let res = new Res();
    req.query = {status: "pending"};
    
    instance.getReservations(req, res);
    
    expect(ReservationModel.find).toHaveBeenCalledTimes(1);
    expect(ReservationModel.find).toHaveBeenCalledWith({user: "userid", status: "pending"});

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({success: true, result: {status: "pending"}});
  });

  it("#getReservations?status=pending should run", () => {
    let req = new Req();
    let res = new Res();
    req.query = {status: "removed"};
    
    instance.getReservations(req, res);
    
    expect(ReservationModel.find).toHaveBeenCalledTimes(1);
    expect(ReservationModel.find).toHaveBeenCalledWith({user: "userid", status: "removed"});
                                    
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({success: true, result: {status: "pending"}});
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
      startDate: new Date(),
      endDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      code: 22,
      sequence: 1,
      room: "roomId01"
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
    expect(ReservationModel).toHaveBeenCalledWith(newReservStubData);
    expect(mockFindOverlappingReservation).toHaveBeenCalledTimes(1);
    expect(mockFindOverlappingReservation).toHaveBeenCalledWith(expect.any(Function));

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith(expect.any(Function));

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({success: true, item: newReservStubData});
  });

  it(
    "#newReservation() should not create a new reservation if it conflits with another reservation",
    () => {

      let req = new Req();
      let res = new Res();

      const newReservStubData: any = {
        startDate: new Date(),
        endDate: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        room: "roomId01"
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

      newReservStubData.user = (req as any).user.sub;
      newReservStubData.status = "pending";
      
      expect(ReservationModel).toHaveBeenCalledTimes(1);
      expect(ReservationModel).toHaveBeenCalledWith(newReservStubData);
      expect(mockFindOverlappingReservation).toHaveBeenCalledTimes(1);
      expect(mockFindOverlappingReservation).toHaveBeenCalledWith(expect.any(Function));

      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith({success: false, message: "overlapping-reservation"});
    }
  );
  
  it("#validateNewReservation() should validate incoming reservation data", () => {
    
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
    const mockBody = jest.fn(() => {return {optional: mockOptional, isISO8601: mockIsISO8601, isString: mockIsString}});
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
    expect(mockIsISO8601).toHaveBeenCalledTimes(4);
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

    ReservationModel.updateOne = jest.fn((arg1, arg2, callback) => callback(null, {nModified: 1}));
    req.body = {status: "approved"};
    const reservStub = {_id: "reservid", user: "userId001"};
    (req as any).reserv = reservStub;

    const mockSave = jest.fn((callback) => callback(null));
    const userStub = {notifications: [], save: mockSave};
    
    UserModel.findById = jest.fn((id, callback) => callback(null, userStub));

    const roomStub = {name: "roomname"};
    RoomModel.findById = jest.fn((id, projection, callback) => {
      callback(null, roomStub);
    });
    
    instance.updateReservation(req, res);

    expect(ReservationModel.updateOne).toHaveBeenCalledTimes(1);
    expect(ReservationModel.updateOne).toHaveBeenCalledWith(
      {_id: "reservid"}, {status: "approved"}, expect.any(Function));
    
    expect(UserModel.findById).toHaveBeenCalledTimes(1);
    expect(UserModel.findById).toHaveBeenCalledWith(reservStub.user, expect.any(Function));
    expect(userStub.notifications.length).toBe(1);
    expect(userStub.notifications[0]).toEqual(
      {message: `Reserva no espaço '${roomStub.name}' aprovada.`, status: "unread"});
    expect(userStub.save).toHaveBeenCalledTimes(1);
    expect(userStub.save).toHaveBeenCalledWith(expect.any(Function));
    
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({success: true, message: "reservation modified"});
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
    expect(res.send).toHaveBeenCalledWith({success: false, message: "invalid status: pending"});
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
       expect(res.send).toHaveBeenCalledWith({success: false, message: "user not authorized"});
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
       expect(res.send).toHaveBeenCalledWith({success: false, message: "user not authorized"});
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
       
       const reservStub = {_id: "reservid001", user: "user000"};
       (req as any).reserv = reservStub;

       (req as any).user = {sub: "user001"};

       ReservationModel.updateOne = jest.fn(
         (query, newData, callback) => callback(null, {nModified: 1}));

       const userStub = {
         notifications: [],
         save: jest.fn((callback) => callback(null))
       };
       
       UserModel.findById = jest.fn((id, callback) => callback(null, userStub));

       const roomStub = {name: "roomname2"};
       RoomModel.findById = jest.fn(
         (query, projection, callback) => callback(null, roomStub));
       
       instance.updateReservation(req, res);
       expect(ReservationModel.updateOne).toHaveBeenCalledTimes(1);
       expect(ReservationModel.updateOne).toHaveBeenCalledWith(
         {_id: reservStub._id}, {status: incomingStatus}, expect.any(Function));

       expect(UserModel.findById).toHaveBeenCalledTimes(1);
       expect(UserModel.findById).toHaveBeenCalledWith(reservStub.user, expect.any(Function));

       expect(userStub.notifications[0]).toEqual(
         {message: `Reserva no espaço '${roomStub.name}' removida.`, status: "unread"});
       expect(userStub.save).toHaveBeenCalledTimes(1);
       expect(userStub.save).toHaveBeenCalledWith(expect.any(Function));

       expect(res.send).toHaveBeenCalledTimes(1);
       expect(res.send).toHaveBeenCalledWith({success: true, message: "reservation modified"});

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

       ReservationModel.updateOne = jest.fn(
         (query, newData, callback) => callback(null, {nModified: 1}));

       const userStub = {
         notifications: [],
         save: jest.fn((callback) => callback(null))
       };
       
       UserModel.findById = jest.fn((id, callback) => callback(null, userStub));
       
       instance.updateReservation(req, res);
       expect(ReservationModel.updateOne).toHaveBeenCalledTimes(1);
       expect(ReservationModel.updateOne).toHaveBeenCalledWith(
         {_id: reservStub._id}, {status: incomingStatus}, expect.any(Function));

       expect(UserModel.findById).toHaveBeenCalledTimes(0);

       expect(res.send).toHaveBeenCalledTimes(1);
       expect(res.send).toHaveBeenCalledWith({success: true, message: "reservation modified"});

       expect(userStub.notifications.length).toBe(0);
       expect(userStub.save).toHaveBeenCalledTimes(0);
     });

  it("#updateReservation() should add a notification when a user of the responsible type\n"
     + "is approving a reservation",  () => {
       const req = new Req();
       const res = new Res();

       const incomingStatus = "approved";
       req.body = {status: incomingStatus};
       
       const reservStub = {_id: "reservid001", user: "user000"};
       (req as any).reserv = reservStub;

       (req as any).user = {sub: "user001"};

       ReservationModel.updateOne = jest.fn(
         (query, newData, callback) => callback(null, {nModified: 1}));

       const userStub = {
         notifications: [],
         save: jest.fn((callback) => callback(null))
       };
       
       UserModel.findById = jest.fn((id, callback) => callback(null, userStub));

       const roomStub = {name: "roomname3"};
       RoomModel.findById = jest.fn(
         (query, projection, callback) => callback(null, roomStub));
       
       instance.updateReservation(req, res);
       expect(ReservationModel.updateOne).toHaveBeenCalledTimes(1);
       expect(ReservationModel.updateOne).toHaveBeenCalledWith(
         {_id: reservStub._id}, {status: incomingStatus}, expect.any(Function));

       expect(UserModel.findById).toHaveBeenCalledTimes(1);
       expect(UserModel.findById).toHaveBeenCalledWith(reservStub.user, expect.any(Function));

       expect(userStub.notifications[0]).toEqual(
         {message: `Reserva no espaço '${roomStub.name}' aprovada.`, status: "unread"});
       expect(userStub.save).toHaveBeenCalledTimes(1);
       expect(userStub.save).toHaveBeenCalledWith(expect.any(Function));

       expect(res.send).toHaveBeenCalledTimes(1);
       expect(res.send).toHaveBeenCalledWith({success: true, message: "reservation modified"});
       
     });

  it('#formatTime() should return a date with the specified time', () => {
    const result = instance.timeToDate('12:00');
    expect(result).toEqual(new Date('2018-01-01T12:00'));
  });
  
});
