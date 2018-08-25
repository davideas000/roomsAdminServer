import { Response, Request } from 'express';

import { ReservationController } from './reservation.controller';
import { ReservationModel } from './../models/reservation.model';

jest.mock('./../models/reservation.model', () => {
  return {
    ReservationModel: jest.fn()
  }
});

ReservationModel.find = jest.fn((query, callback) => { callback(null, {status: "pending"})});

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

    req.query = {status: "approved"};
    
    instance.getReservations(req, res);
    
    expect(ReservationModel.find).toHaveBeenCalledTimes(1);
    expect(ReservationModel.find).toBeCalledWith({userId: "userid", status: "approved"},
                                                 expect.any(Function));
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({status: "pending"});
  });

  it("#getReservations?status=pending should run", () => {
    let req = new Req();
    let res = new Res();
    req.query = {status: "pending"};
    
    instance.getReservations(req, res);
    
    expect(ReservationModel.find).toHaveBeenCalledTimes(1);
    expect(ReservationModel.find).toHaveBeenCalledWith({userId: "userid", status: "pending"},
                                                       expect.any(Function));
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({status: "pending"});
  });

  it("#getReservations?status=pending should run", () => {
    let req = new Req();
    let res = new Res();
    req.query = {status: "removed"};
    
    instance.getReservations(req, res);
    
    expect(ReservationModel.find).toHaveBeenCalledTimes(1);
    expect(ReservationModel.find).toHaveBeenCalledWith({userId: "userid", status: "removed"},
                                                       expect.any(Function));
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({status: "pending"});
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
    expect(ReservationModel.findOne).toHaveBeenCalledWith({_id: "ddd1", userId: "userid"},
                                                          expect.any(Function));

    expect(temp.remove).toHaveBeenCalledTimes(1);
  });

  it("#deleteReservation#/:id should mark approved reservations as removed", () => {
    let req = new Req();
    let res = new Res();
    req.params = {id: "ddd1"}

    const temp = {
      status: "approved",
      _id: "ddd1"
    };
    
    ReservationModel.findOne = jest.fn((query, callback) => callback(null, temp));
    ReservationModel.findOneAndUpdate = jest.fn((query, updata, opt, callback) => callback(null, temp));
    
    instance.deleteReservation(req, res);
    
    expect(ReservationModel.findOne).toHaveBeenCalledTimes(1);
    expect(ReservationModel.findOne).toHaveBeenCalledWith(
      {_id: "ddd1", userId: "userid"}, expect.any(Function));
    expect(ReservationModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(ReservationModel.findOneAndUpdate).toBeCalledWith(
      {_id: "ddd1"}, {status: "removed"}, {new: true}, expect.any(Function));
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
      roomId: "roomId01"
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

    newReservStubData.userId = (req as any).user.sub;
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
        roomId: "roomId01"
      };
      
      req.body = newReservStubData;

      const mockFindOverlappingReservation = jest.fn((callback) => {
        callback(null, [{roomId: "room11"}]);
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

      newReservStubData.userId = (req as any).user.sub;
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
    // TODO
  });
  
});
