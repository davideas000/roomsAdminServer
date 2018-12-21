import { UserController } from "./user.controller";
import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import { DepartmentModel } from "../models/department.model";
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken', () => {
  return jest.fn();
});

jest.mock("../models/user.model", () => {
  return {
    UserModel: jest.fn()
  }
});

jest.mock("../models/department.model", () => {
  return {
    DepartmentModel: jest.fn()
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

  it("#getCurrentUser() should search for the currently logged in user", () => {
    const userStub = {name: "temp", email: "temp@example.com"};
    UserModel.findById = jest.fn((id, projec, callback) => {callback(null, userStub)});
    instance.getCurrentUser(req, res);
    
    expect(UserModel.findById).toHaveBeenCalledTimes(1);
    expect(UserModel.findById).toHaveBeenCalledWith(
      (req as any).user.sub, "name displayName email photoURL role",
      expect.any(Function));

    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(userStub);
    
  });

  it('#getCurrentUser() should return the acronym of the department for '
     + 'which the user is responsible | the user type is `responsible`', () => {
       (req as any).user.dep = 'dep001';
       const userStub: any = {
         name: "temp",
         displayName: 'userdisplayname',
         email: "temp@example.com",
         photoURL: 'photo',
         role: 'responsible'
       };
       UserModel.findById = jest.fn((id, projec, callback) => {callback(null, userStub)});
       const depStub = {name: "temp", acronym: 'IOGO'};
       DepartmentModel.findById = jest.fn((id, projec, callback) => {callback(null, depStub)});
       instance.getCurrentUser(req, res);

       expect(UserModel.findById).toHaveBeenCalledTimes(1);
       expect(UserModel.findById).toHaveBeenCalledWith(
         (req as any).user.sub, "name displayName email photoURL role",
         expect.any(Function));

       expect(DepartmentModel.findById).toHaveBeenCalledTimes(1);
       expect(DepartmentModel.findById).toHaveBeenCalledWith(
         (req as any).user.dep, "acronym",
         expect.any(Function));
       expect(res.send).toHaveBeenCalledTimes(1);
       userStub.department = depStub.acronym;
       expect(res.send).toHaveBeenCalledWith(userStub);
     });

  it('#login() should return a error if there is no email', () => {
    req.body = {password: 'pass'};
    instance.login(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({success: false, message: 'missing-email'});
  });

  it('#login() should return a error if there is no password', () => {
    req.body = {email: 'email@email'};
    instance.login(req, res);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({success: false, message: 'wrong-password'});
  });

  it('#login() should return an error if the user is inexistent', () => {
    UserModel.findOne = jest.fn((query, callback) => callback(null, null));
    req.body = {email: 'email@email', password: 'pass'};
    instance.login(req, res);

    expect(UserModel.findOne).toHaveBeenCalledTimes(1);
    expect(UserModel.findOne).toHaveBeenCalledWith(
      {email: req.body.email}, expect.any(Function));
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({success: false, message: 'user-not-found'});
  });

  it('#login() should return an error if the password is wrong', () => {
    const userStub = {checkPassword: jest.fn((pass, callback) => callback(false))};
    UserModel.findOne = jest.fn((query, callback) => callback(null, userStub));
    req.body = {email: 'email@email', password: 'pass'};
    instance.login(req, res);

    expect(UserModel.findOne).toHaveBeenCalledTimes(1);
    expect(UserModel.findOne).toHaveBeenCalledWith(
      {email: req.body.email}, expect.any(Function));
    expect(userStub.checkPassword).toHaveBeenCalledTimes(1);
    expect(userStub.checkPassword).toHaveBeenCalledWith(
      req.body.password, expect.any(Function));
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({success: false, message: 'wrong-password'});
  });

  // internal error
  it('#login() should return an error when checkPassword() goes wrong', () => {
    const userStub = {checkPassword: jest.fn(
      (pass, callback) => callback({message: 'internal-error'}))};
    UserModel.findOne = jest.fn((query, callback) => callback(null, userStub));
    req.body = {email: 'email@email', password: 'pass'};
    instance.login(req, res);

    expect(UserModel.findOne).toHaveBeenCalledTimes(1);
    expect(UserModel.findOne).toHaveBeenCalledWith(
      {email: req.body.email}, expect.any(Function));
    expect(userStub.checkPassword).toHaveBeenCalledTimes(1);
    expect(userStub.checkPassword).toHaveBeenCalledWith(
      req.body.password, expect.any(Function));
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith({success: false, message: 'internal-error'});
  });

  it('#login() should return a token when login goes well', () => {
    const tokenStub = "token001";
    jwt.sign = jest.fn(() => tokenStub);
    const checkPassword = jest.fn(
      (pass, callback) => callback(true));

    const userStub = {
      _id: 'userid001',
      name: 'username',
      displayName: 'displayname',
      email: 'useremail',
      photoURL: 'userphotourl',
      role: 'userrole',
      checkPassword: checkPassword
    };
    UserModel.findOne = jest.fn((query, callback) => callback(null, userStub));

    req.body = {email: 'email@email', password: 'pass'};
    instance.login(req, res);

    delete userStub.checkPassword;

    expect(UserModel.findOne).toHaveBeenCalledTimes(1);
    expect(UserModel.findOne).toHaveBeenCalledWith(
      {email: req.body.email}, expect.any(Function));
    expect(checkPassword).toHaveBeenCalledTimes(1);
    expect(checkPassword).toHaveBeenCalledWith(
      req.body.password, expect.any(Function));
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(
      {success: true, token: tokenStub, profile: userStub, expiresIn: 600000}
    );
  });

  it('#login() should add the dep field to the token when the user role '
     + 'is \'responsble\'', () => {
       const tokenStub = "token001";
       jwt.sign = jest.fn(() => tokenStub);
       const checkPassword = jest.fn(
         (pass, callback) => callback(true));

       const userStub = {
         _id: 'userid001',
         name: 'username',
         displayName: 'displayname',
         email: 'useremail',
         photoURL: 'userphotourl',
         role: 'responsible',
         checkPassword: checkPassword
       };
       UserModel.findOne = jest.fn((query, callback) => callback(null, userStub));

       const depStub = {
         _id: 'userid001',
         name: 'username',
         displayName: 'displayname',
         email: 'useremail',
         photoURL: 'userphotourl',
         role: 'responsible',
         checkPassword: checkPassword
       };
       DepartmentModel.findOne = jest.fn((query, callback) => callback(null, depStub));

       req.body = {email: 'email@email', password: 'pass'};
       instance.login(req, res);

       delete userStub.checkPassword;

       expect(UserModel.findOne).toHaveBeenCalledTimes(1);
       expect(UserModel.findOne).toHaveBeenCalledWith(
         {email: req.body.email}, expect.any(Function));
       expect(checkPassword).toHaveBeenCalledTimes(1);
       expect(checkPassword).toHaveBeenCalledWith(
         req.body.password, expect.any(Function));
       expect(DepartmentModel.findOne).toHaveBeenCalledTimes(1);
       expect(DepartmentModel.findOne).toHaveBeenCalledWith(
         {user: userStub._id}, expect.any(Function));
       expect(jwt.sign).toHaveBeenCalledTimes(1);
       expect(jwt.sign).toHaveBeenCalledWith(
         {role: userStub.role, dep: depStub._id}, // should add dep field to the token
         expect.any(String), expect.any(Object)
       );
       expect(res.send).toHaveBeenCalledTimes(1);
       expect(res.send).toHaveBeenCalledWith(
         {success: true, token: tokenStub, profile: userStub, expiresIn: 600000}
       );
     });
  
  it('#_updateProfile() should update user profile ', () => {
    const newDataStub = {
      name: 'newname',
      displayName: 'newdisplayname',
      email: 'newemail'
    };
    req.body = newDataStub;
    const updatedUserStub = {
      _id: '0002',
      name: 'updatedname',
      displayName: 'updateddisplayname',
      email: 'updatedemail',
      role: 'userrole'
    };
    UserModel.findByIdAndUpdate = jest.fn(
      (userid, newdata, options, callback) => callback(null, updatedUserStub));
    const next = jest.fn();
    const fns = instance.updateProfile();
    fns[4](req, res, next);
    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'user0001', newDataStub, {new: true}, expect.any(Function));
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(updatedUserStub);
  });
});
