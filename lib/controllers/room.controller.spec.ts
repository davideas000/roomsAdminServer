import { RoomController } from './room.controller';
import { Request, Response } from 'express';
import { RoomModel } from '../models/room.model';
import { ReservationModel } from '../models/reservation.model';
import { ReservationController } from './reservation.controller';

jest.mock('../models/room.model', () => {
  return {
    RoomModel: jest.fn()
  };
});

jest.mock('../models/reservation.model', () => {
  return {
    ReservationModel: jest.fn()
  };
});

describe('RoomController', () => {
  
  const Req = jest.fn<Request>().mockImplementation(() => {
    return {};
  });
  const req = new Req();

  const Res = jest.fn<Response>().mockImplementation(() => {
    return {
      send: jest.fn()
    };
  });
  const res = new Res();
  res.status = jest.fn(() => res);
  
  let instance: RoomController;
  beforeEach(() => {
    instance = new RoomController();
  });

  it('#getTypes() should return room types', () => {
    const resultStub = [{type: 'room'}, {type: 'lab'},
                        {type: 'room'}, {type: 'lab'}];
    RoomModel.find = jest.fn((q, p, callback) => callback(null, resultStub));
    instance.getTypes(req, res);
    expect(RoomModel.find).toHaveBeenCalledTimes(1);
    expect(RoomModel.find).toHaveBeenCalledWith({}, 'type', expect.any(Function));
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(
      [resultStub[0].type, resultStub[1].type]
    );
  });

  // FIXME: spell check
  it('#getExcludes() should call next() if there aren\'t any query paramenters ', () => {
    const nextMock = jest.fn();
    res.locals = {};
    req.query = {};
    instance.getExcludes(req, res, nextMock);
    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(res.locals.excludes).toBeUndefined();
  });

  // FIXME, english spell check
  it('#getExcludes() should set res.locals.excludes if there are some query paramenters ', () => {
    const nextMock = jest.fn();
    res.locals = {};
    req.query = {
      startDate: "01-01-2199",
      endDate: "01-01-2199",
      startTime: "11:00",
      endTime: "13:00"
    };

    const mockGetExludesResult = [];
    const excludesStub = ['roomid00', 'roomid01', 'roomid02'];
    for(let i of excludesStub) {
      mockGetExludesResult.push({room: i});
    }

    ReservationModel.mockImplementation(() => {
      return {
        findOverlappingReservations: jest.fn(
          (callback) =>
            {
              callback(null, mockGetExludesResult);
            }
        )
      };
    });

    instance.getExcludes(req, res, nextMock);
    expect(ReservationModel).toHaveBeenCalledTimes(1);

    const expecResult = req.query;
    expecResult.startTime = ReservationController.timeToDate(expecResult.startTime);
    expecResult.endTime = ReservationController.timeToDate(expecResult.endTime);
    expect(ReservationModel).toHaveBeenCalledWith(expecResult);
    
    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(res.locals.excludes).toEqual(excludesStub);
  });

  // FIXME, english spell check
  it('#getExcludes() should send an 500 status code on error', () => {
    const nextMock = jest.fn();
    res.locals = {};
    req.query = {
      startDate: "01-01-2199",
      endDate: "01-01-2199",
      startTime: "12:00",
      endTime: "18:00"
    };

    const mockGetExludesResult = [];
    const errorStub = {message: 'server error'};
    
    ReservationModel.mockImplementation(() => {
      return {
        findOverlappingReservations: jest.fn(
          (callback) =>
            {
              callback(errorStub, mockGetExludesResult);
            }
        )
      };
    });

    instance.getExcludes(req, res, nextMock);

    expect(nextMock).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({success: false, message: errorStub.message});
    expect(res.locals.excludes).toBeUndefined();
  });

  // FIXME: english spell check
  it('#findRoomsAndExclude() should use default values when ' +
     'query parameters are not specified', () => {
       RoomModel.exec = jest.fn();
       RoomModel.populate = jest.fn((m) => RoomModel);
       RoomModel.find = jest.fn((q) => RoomModel);
       
       instance.findRoomsAndExclude(req, res);
       expect(RoomModel.find).toHaveBeenCalledTimes(1);
       expect(RoomModel.find).toHaveBeenCalledWith(
         {
           width: {$gte: 0},
           length: {$gte: 0},
           capacity: {$gte: 0}
         });
     });

  // FIXME: english spell check
  it('#findRoomsAndExclude() without any query parameters '
     + 'and with excludes array empty should send all rooms', () => {
       const roomsStub = [
         {_id: 'room01'},
         {_id: 'room02'},
         {_id: 'room03'}
       ];
       RoomModel.exec = jest.fn((callback) => callback(null, roomsStub));
       RoomModel.populate = jest.fn((m) => RoomModel);
       RoomModel.find = jest.fn((q) => RoomModel);

       instance.findRoomsAndExclude(req, res);
       expect(RoomModel.find).toHaveBeenCalledTimes(1);
       expect(RoomModel.find).toHaveBeenCalledWith(
         {
           width: {$gte: 0},
           length: {$gte: 0},
           capacity: {$gte: 0}
         });
       expect(RoomModel.populate).toHaveBeenCalledTimes(1);
       expect(RoomModel.populate).toHaveBeenCalledWith('department');

       expect(res.send).toHaveBeenCalledTimes(1);
       expect(res.send).toHaveBeenCalledWith({success: true, result: roomsStub});
     });

  // FIXME: english spell check
  it('#findRoomsAndExclude() should use specified query parameters', () => {
    RoomModel.exec = jest.fn((callback) => callback(null, []));
    RoomModel.populate = jest.fn((m) => RoomModel);
    RoomModel.find = jest.fn((q) => RoomModel);
    
    req.query = {
      width: 10,
      length: 10,
      capacity: 10,
      department: 'dep01',
      rtype: 'roomType'
    };
    
    instance.findRoomsAndExclude(req, res);
    expect(RoomModel.find).toHaveBeenCalledTimes(1);
    expect(RoomModel.find).toHaveBeenCalledWith(
      {
        width: {$gte: req.query.width},
        length: {$gte: req.query.length},
        capacity: {$gte: req.query.capacity},
        department: req.query.department,
        type: req.query.type
      });
    expect(RoomModel.populate).toHaveBeenCalledTimes(1);
    expect(RoomModel.populate).toHaveBeenCalledWith('department');
  });

  // FIXME: english spell check
  it('#findRoomsAndExclude() should not send rooms with id specified in the excludes array',
     () => {
       const roomsStub = [
         {_id: 'room01'},
         {_id: 'room02'},
         {_id: 'room03'}
       ];
       RoomModel.exec = jest.fn((callback) => callback(null, roomsStub));
       RoomModel.populate = jest.fn((m) => RoomModel);
       RoomModel.find = jest.fn((q) => RoomModel);
       
       res.locals.excludes = ['room01', 'room03'];

       instance.findRoomsAndExclude(req, res);
       expect(res.send).toHaveBeenCalledTimes(1);
       expect(res.send).toHaveBeenCalledWith({success: true, result: [roomsStub[1]]});
       expect(RoomModel.populate).toHaveBeenCalledTimes(1);
       expect(RoomModel.populate).toHaveBeenCalledWith('department');
     });

});
