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
    const temp = req.body;
    res.send(temp);
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

  validateReservation(): any[] {
    return [
      body("reason").optional().isString().not().isEmpty().trim().escape(),
      body("startDate").isISO8601(),
      body("endDate").isISO8601(),
      body("startTime").isISO8601(),
      body("endTime").isISO8601(),
      body("code").optional().isInt({min: 0}),
      body("sequence").optional().isInt({min: 0}),
      body("roomId").isString().custom((value, ot) => {
        return new Promise((accept, reject) => {
          RoomModel.countDocuments({_id: ot.req.body.roomId}, (err, result) => {
            if (err) {
              return reject(`Room with id ${ot.req.body.roomId} not found`);
            }
            if (result === 1) {
              return accept(true);
            }
            reject(`Room with id ${ot.req.body.roomId} not found`)
          });
        });
      }),
      (req: Request, res: Response, next: NextFunction) => {
        const errors: Result = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).send({success: false, errors: errors.array()});
        }
        next();
      }
    ]
  }
}
