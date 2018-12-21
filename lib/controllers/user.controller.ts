import { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/user.model";
import { config } from './../config/config';
import * as jwt from 'jsonwebtoken';
import * as expressJwt from 'express-jwt';
import { DepartmentModel } from "../models/department.model";
import { body, validationResult, Result } from 'express-validator/check';

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
      if (reqUser.dep) {
        return DepartmentModel.findById(reqUser.dep, 'acronym', (err, dep) => {
          if (err) {
            return res.status(500).send({message: err.message});
          }
          const temp = {
            _id: user._id,
            name: user.name,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: user.role,
            department: dep.acronym
          }
          return res.send(temp);
        });
      }
      res.send(user);
    });
  }

  //////////////////////////////////////////////
  //////////// UPDATE PROFILE /////////////////
  //////////////////////////////////////////////
  updateProfile() {
    return [
      body('email').isEmail().withMessage('not a valid email'),
      body('name').trim()
        .isLength({min: 5}).withMessage('must be at least 5 chars long')
        .escape(),
      body('displayName').not().isEmpty().withMessage('must not be empty')
        .trim().escape(),
      this.checkValidationErrors,
      this._updateProfile
    ];
  }

  private checkValidationErrors(req: Request, res: Response, next: NextFunction) {
    const errors: Result = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).send(errors.array());
    }
    next();
  }
  
  private _updateProfile(req: Request, res: Response, next: NextFunction) {
    const userId = (req as any).user.sub;
    const updateData = {
      name: req.body.name,
      displayName: req.body.displayName,
      email: req.body.email
    };
    UserModel.findByIdAndUpdate(
      userId, updateData, {new: true}, (err, updatedUser) => {
        if (err) {
          if (err.code && err.code === 11000) {
            return res.status(401).send({message: 'duplicate-email'});
          }
          return res.status(500).send({message: 'internal server error'});
        }
        if (!updatedUser) {
          return res.status(401).send({message: 'user-not-found'});
        }
        const userTemp = {
          _id: updatedUser._id,
          name: updatedUser.name,
          displayName: updatedUser.displayName,
          email: updatedUser.email,
          photoURL: updatedUser.photoURL,
          role: updatedUser.role
        };
        res.send(userTemp);
      });
  }
}
