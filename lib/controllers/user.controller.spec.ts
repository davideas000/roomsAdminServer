import { UserController } from "./user.controller";
import { Request, Response } from "express";
import { UserModel } from "../models/user.model";

jest.mock("../models/user.model", () => {
  return {
    UserModel: jest.fn()
  }
});

const Req = jest.fn<Request>().mockImplementation(() => {
  return {
    user: {
      sub: "user0001"
    }
  };
});

const Res = jest.fn<Response>().mockImplementation(() => {
  return {
    status: jest.fn(),
    send: jest.fn()
  };
});

describe("UserController", () => {
  let instance: UserController;
  let req = new Req();
  let res = new Res();
  (res as any).status.mockReturnValue(res);
  
  beforeAll(() => {
    instance = new UserController();
  });

  it("should be created", () => {
    expect(instance).toBeDefined();
  });

  it("#getCurrentUser() should return current logged user", () => {
    const userStub = {name: "temp", email: "temp@example.com"};
    UserModel.findById = jest.fn((id, projec, callback) => {callback(null, userStub)});
    instance.getCurrentUser(req, res);

    expect(UserModel.findById).toHaveBeenCalledTimes(1);
    expect(UserModel.findById).toHaveBeenCalledWith(
      (req as any).user.sub, "name displayName email photoURL role",
      expect.any(Function));

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({success: true, result: userStub});
    
  });
  
});
