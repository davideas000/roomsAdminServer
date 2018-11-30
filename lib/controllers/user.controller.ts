import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import { config } from './../config/config';
import * as jwt from 'jsonwebtoken';
import * as expressJwt from 'express-jwt';
import { DepartmentModel } from "../models/department.model";

export class UserController {
  
  private _authGuard = expressJwt({
    secret: config.secret
  });

  get authGuard() {
    return this._authGuard;
  }

  login(req: Request, res: Response) {
    const email = req.body.email;
    const password = req.body.password;

    if (!email)
    {
      return res.status(401).send({success: false, message: 'missing-email'});
    }

    if(!password) {
      return res.status(401).send({success: false, message: 'wrong-password'});
    }

    UserModel.findOne(
      {email: email},
      (err, user) => {
        if (err) {
          return res.status(500).send({success: false, message: err.message});
        }
        if (!user) {
          return res.status(401).send({success: false, message: 'user-not-found'})
        }

        user.checkPassword(password, function(result) {
          if (result === true) {
            const EXPIRES_IN = 600000;
            const tempUser = {
              _id: user._id,
              name: user.name,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              role: user.role
            };

            if (user.role === 'responsible') {
              DepartmentModel.findOne({user: user._id}, (err, dep) => {
                if (err) {
                  return res.status(500).send({message: err.message});
                }
                const token = jwt.sign(
                  {role: user.role, dep: dep._id.toString()}, config.secret,
                  {expiresIn: EXPIRES_IN, subject: user._id.toString()}
                );
                return res.send({success: true, token: token, profile: tempUser, expiresIn: EXPIRES_IN});
              });
            } else {
              const token = jwt.sign({role: user.role}, config.secret,
                                     {expiresIn: EXPIRES_IN, subject: user._id.toString()});
              return res.send({success: true, token: token, profile: tempUser, expiresIn: EXPIRES_IN});
            }
          }

          if (result === false) {
            return res.status(401).send({success: false, message: 'wrong-password'})
          }

          if (result.message) {

            res.status(500).send({success: false, message: result.message})
          }
        });
      });
  }

  getCurrentUser(req: Request, res: Response) {
    let reqUser = (req as any).user;
    UserModel.findById(reqUser.sub, "name displayName email photoURL role", (err, user) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      res.send(user);
    });
  }
  
}
