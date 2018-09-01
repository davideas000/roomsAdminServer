import { Request, Response } from "express";
import { NotificationController } from "./notification.controller";
import { UserModel } from "../models/user.model";

jest.mock("../models/user.model", () => {
  return {
    UserModel: jest.fn()
  }
});

describe("NotificationController", () => {

  const Req = jest.fn<Request>().mockImplementation(() => {
  });

  const Res = jest.fn<Request>().mockImplementation(() => {
  });
  
  let instance: NotificationController;
  
  beforeAll(() => {
    instance = new NotificationController();
  });

  let req;
  let res;
  beforeEach(() => {
    req = new Req();
    res = new Res();
  })

  it("#getCurrentUserReservations() should return current user notifications", () => {

    req.user = {sub: "userid001"};
    res.status = jest.fn();
    res.status.mockReturnValue(res);
    res.send = jest.fn();

    const userStub = {
      notifications: [
        {message: "notifi 1"}
      ]
    };
    
    UserModel.findById = jest.fn((id, projection, callback) => callback(null, userStub));
    
    instance.getCurrentUserNotifications(req, res);
    expect(UserModel.findById).toHaveBeenCalledTimes(1);
    expect(UserModel.findById).toHaveBeenCalledWith(
      req.user.sub, "notifications", expect.any(Function));
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({success: true, result: userStub.notifications});
    
  });
  
});

