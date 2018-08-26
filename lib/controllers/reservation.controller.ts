import { Request, Response, NextFunction } from 'express';

import { ObjectId } from 'mongoose';
import { body, validationResult, Result } from 'express-validator/check';
import { sanitizeBody } from 'express-validator/filter';

import { ReservationModel } from './../models/reservation.model';
import { RoomModel } from './../models/room.model';

export class ReservationController {

  getReservations(req: Request, res: Response) {
    const status = req.query.status;
    ReservationModel.find({userId: (req as any).user.sub, status: status}, (err, reservations: any[]) => {
      if (err) {
        return res.send({success: false, message: err.message});
      }
      res.send(reservations);
    });
  }

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

  validateNewReservation(): any[] {
    return [
      body("reason").optional().isString().not().isEmpty().trim().escape(),
      body("startDate").isISO8601(),
      body("endDate").isISO8601(),
      body("startTime").isISO8601(),
      body("endTime").isISO8601(),
      body("code").optional().isInt({min: 0}),
      body("sequence").optional().isInt({min: 0}),
      body("roomId").isString().custom(this.checkRoomExistence),
      (req: Request, res: Response, next: NextFunction) => {
        const errors: Result = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).send({success: false, errors: errors.array()});
        }
        next();
      }
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

}
