import { DepartmentController } from "./department.controller";
import { DepartmentModel } from "../models/department.model";
import { Request, Response } from 'express';

jest.mock('../models/department.model', () => {
  return {
    DepartmentModel: jest.fn()
  };
});

describe('DepartmentController', () => {
  let instance: DepartmentController;
  
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
  res.status = jest.fn((code) => res);
    
  beforeEach(() => {
    instance = new DepartmentController();
  });

  it('#getAcronyms() should return department acronyms', () => {
    const depsStub = [{acronym: 'IEG'}, {acronym: 'IOG'}, {acronym: 'IUG'}];
    DepartmentModel.find = jest.fn((query, projec, callback) => callback(null, depsStub));
    instance.getDeps(req, res);

    expect(DepartmentModel.find).toHaveBeenCalledTimes(1);
    expect(DepartmentModel.find).toHaveBeenCalledWith({}, 'name acronym', expect.any(Function));
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(
      {success: true,
       result: depsStub}
    );
  });
  
  it('#getAcronyms() should return a 500 status code on error', () => {
    const errorStub = {message: 'server error'};
    DepartmentModel.find = jest.fn((query, projec, callback) => callback(errorStub, null));
    instance.getDeps(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({success: false, message: errorStub.message});
  });
  
});
