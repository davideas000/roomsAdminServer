import { Response, Request } from 'express';

import { ReservationController } from './reservation.controller';
import { ReservationModel } from './../models/reservation.model';

jest.mock('./../models/reservation.model', () => {
  return {
    ReservationModel: {
      find: jest.fn((query, callback) => { callback(null, {status: "pending"})}),
    }
  };
});

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
  
  it("#getReservation?status=aproved should run", () => {
    let req = new Req();
    let res = new Res();

    req.query = {status: "aproved"};
    
    instance.getReservations(req, res);
    
    expect(ReservationModel.find).toHaveBeenCalledTimes(1);
    expect(ReservationModel.find).toBeCalledWith({userId: "userid", status: "aproved"},
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

  it("#deleteReservation#/:id should run", () => {
    let req = new Req();
    let res = new Res();
    req.params = {id: "ddd1"}

    const temp = {
      status: "pending",
      remove: jest.fn()
    };
    
    ReservationModel.find = jest.fn((query, callback) => callback(null, temp));
    
    instance.deleteReservation(req, res);
    
    expect(ReservationModel.find).toHaveBeenCalledTimes(1);
    expect(ReservationModel.find).toHaveBeenCalledWith({_id: "ddd1", userId: "userid"},
                                                       expect.any(Function));

    expect(temp.remove).toHaveBeenCalledTimes(1);
  });
  
});
