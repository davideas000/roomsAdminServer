import { RoomController } from './room.controller';
import { Request, Response } from 'express';
import { RoomModel } from '../models/room.model';

jest.mock('../models/room.model', () => {
  return {
    RoomModel: jest.fn()
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
  
  let instance: RoomController;
  beforeEach(() => {
    instance = new RoomController();
  });

  it('#getTypes() should return room types', () => {
    const resultStub = [{type: 'room'}, {type: 'lab'}];
    RoomModel.find = jest.fn((q, p, callback) => callback(null, resultStub));
    instance.getTypes(req, res);
    expect(RoomModel.find).toHaveBeenCalledTimes(1);
    expect(RoomModel.find).toHaveBeenCalledWith({}, 'type', expect.any(Function));
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      result: [resultStub[0].type, resultStub[1].type]
    });
  });
})
