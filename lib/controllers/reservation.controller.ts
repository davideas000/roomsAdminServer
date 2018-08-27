import { Request, Response, NextFunction } from 'express';

import { ObjectId } from 'mongoose';
import { body, validationResult, Result } from 'express-validator/check';
import { sanitizeBody } from 'express-validator/filter';

import { ReservationModel } from './../models/reservation.model';
import { RoomModel } from './../models/room.model';
import { DepartmentModel } from './../models/department.model';


export class ReservationController {

  /////////////////////////////////////////////////
  //////////////////// LIST ///////////////////////
  /////////////////////////////////////////////////
  
  getReservations(req: Request, res: Response) {
    const status = req.query.status;
    ReservationModel.find({userId: (req as any).user.sub, status: status}, (err, reservations: any[]) => {
      if (err) {
        return res.send({success: false, message: err.message});
      }
      res.send(reservations);
    });
  }

  /////////////////////////////////////////////////
  ////////////////// CREATE ///////////////////////
  /////////////////////////////////////////////////

  newReservation(req: Request, res: Response) {
    const temp = {
      reason: req.body.reason,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      code: req.body.code,
      sequence: req.body.sequence,
      status: "pending",
      userId: (req as any).user.sub,
      roomId: req.body.roomId,
    };
    
    const newReserv = new ReservationModel(temp);

    newReserv.findOverlappingReservations((err: any, result: any[]) => {
      if (err) {
        res.status(500).send("server-error");
      }

      if (result.length !== 0) {
        return res.send({success: false, message: "overlapping-reservation"})
      }
      
      newReserv.save((err, item) => {
        if (err) {
          return res.status(500).send("internal-server-error");
        }
        res.send({success: true, item: item});
      });
      
    });
  }

  validateNew(): any[] {
    return [
      body("reason").optional().isString().not().isEmpty().trim().escape(),
      body("startDate").isISO8601(),
      body("endDate").isISO8601(),
      body("startTime").isISO8601(),
      body("endTime").isISO8601(),
      body("code").optional().isInt({min: 0}),
      body("sequence").optional().isInt({min: 0}),
      body("roomId").isString().custom(this.checkRoomExistence),
      this.checkValidationErrors
    ]
  }

  checkRoomExistence(value, obj): Promise<any> {
    return new Promise((accept, reject) => {
      RoomModel.countDocuments({_id: obj.req.body.roomId}, (err, result) => {
        if (err) {
          return reject(err.message);
        }
        if (result === 1) {
          return accept(true);
        }
        reject(`Room with id ${obj.req.body.roomId} not found`)
      });
    });
  }

  checkValidationErrors(req: Request, res: Response, next: NextFunction) {
    const errors: Result = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).send({success: false, errors: errors.array()});
    }
    next();
  }

  /////////////////////////////////////////////////
  ////////////////// UPDATE ///////////////////////
  /////////////////////////////////////////////////
  
  // it is possible to update only the status field
  updateReservation(req: Request, res: Response) {
    const newStatus = req.body.status;
    const reserv = (req as any).reserv;
    
    ReservationModel.updateOne({_id: reserv._id}, {status: newStatus}, (err, result) => {
      if (err) {
        return res.send({success: false, message: err.message})
      }
      if (result.nModified === 1) {
        return res.send({success: true, message: "reservation modified"});
      }
    });
  }

  validateUpdate(req: Request, res: Response, next: NextFunction) {
    
    const newStatus: string = req.body.status;
    if (newStatus !== "approved" && newStatus !== "removed") {
      return res.status(401).send({success: false, message: "invalid status"});
    }
    
    const user = (req as any).user;
    
    ReservationModel.findById(req.params.id, (err, reserv) => {
      // console.log("controller reserv", reserv); // $$$$dddd
      if (err) {
        return res.send({success: false, message: err.message});
      }

      if (reserv.status === "removed") {
        return res.status(401).send({success: false, message: "reservation already removed"});
      }
      
      (req as any).reserv = reserv;
      
      if (user.role === "auth") {
        console.log("reserv.userId", reserv.userId); // $$$$dddd
        console.log("user.sub", user.sub);           // $$$$dddd
        if (reserv.userId.toString() === user.sub
            && reserv.status === "approved"
            && newStatus === "removed") {
          return next();
        }
        return res.status(401).send({success: false, message: "user not authorized"});
      }

      if (reserv.status === "approved" && newStatus === "approved") {
        return res.send({success: false, message: "reservation already approved"})
      }
      
      RoomModel.findById(reserv.roomId, "departmentId", (err, room) => {
        if (err) {
          return res.send({success: false, message: err.message});
        }
        
        DepartmentModel.findById(room.departmentId, "userId", (err, dep) => {
          if (err) {
            return res.send({success: false, message: err.message});
          }
          if (dep.userId !== user.sub) {
            return res.status(401).send({success: false, message: "user not authorized"});
          }
          next();
        });
        
      });
      
    });
    
  }

  /////////////////////////////////////////////////
  ////////////////// DELETE ///////////////////////
  /////////////////////////////////////////////////

  deleteReservation(req: Request, res: Response) {
    const id = req.params.id;

    ReservationModel.findOne({_id: id, userId: (req as any).user.sub}, (err, reserv) => {
      if (err) {
        res.send({success: false, message: "Reservation not found"});
      } else if (reserv.status === "pending") {
        reserv.remove((err) => {
          if (err) {
            return res.send({success: false, message: err.message});
          }
          res.send({success: true, item: reserv});
        });
        
      } else if (reserv.status === "approved") {
        ReservationModel.findOneAndUpdate(
          {_id: reserv._id}, {status: "removed"}, {new: true}, (err, reser) => {
            if (err) {
              return res.send({success: false, message: "Reservation not found" })
            }
            res.send({success: true, item: reser});
          });
      } else {
        res.sendStatus(403);
      }
    });
  }

}
