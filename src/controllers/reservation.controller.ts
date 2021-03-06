import { Request, Response, NextFunction } from 'express';

import { ObjectId } from 'mongoose';
import { body, validationResult, Result } from 'express-validator/check';
import { sanitizeBody } from 'express-validator/filter';

import { ReservationModel } from './../models/reservation.model';
import { RoomModel } from './../models/room.model';
import { DepartmentModel } from './../models/department.model';
import { UserModel } from './../models/user.model';

export class ReservationController {

  /////////////////////////////////////////////////
  //////////////////// LIST ///////////////////////
  /////////////////////////////////////////////////

  static timeToDate(time: string): Date {
    return new Date(`2018-01-01T${time}+0000`);
  }

  getGuard(req: Request, res: Response, next: NextFunction) {
    const op = req.query.op;
    const by = req.query.by;
    if ((op && op === 'countdep' || by === 'dep') && !(req as any).user.dep) {
      return res.status(401).send({message: 'user-not-authorized'});
    }
    next();
  }

  static countRvs(res: Response, cond: any) {
    const callback = (err, count: any) => {
      if (err) {
        console.error(err);
        return res.status(500).send({message: err.message});
      }
      let result;
      if (typeof count === 'number') {
        result = count;
      } else {
        result = count[0] && count[0].n || 0;
      }
      res.json(result);
    };

    if (cond.dep) {
      ReservationModel.countDocuments().countByStatusAndDep(
        cond.status, cond.dep
      ).exec(callback);
    } else {
      ReservationModel.countDocuments(cond)
        .exec(callback);
    }
  }

  static findRvs(res: Response,
                 cond: {status: string, user?: string, dep?: string}) {
    const callback = (err, reservations: any[]) => {
      if (err) {
        console.error(err);
        return res.status(500).send({message: err.message});
      }
      return res.send(reservations);
    }

    if (cond.dep) {
      ReservationModel.find().byStatusAndDep(cond.status, cond.dep)
        .exec(callback);
    } else {
      ReservationModel.find({user: cond.user, status: cond.status})
        .populate({path: "room", populate: {path: "department"}})
        .exec(callback);
    }
  }
  
  getReservations(req: Request, res: Response) {
    const status = req.query.status;
    const op = req.query.op;
    const by = req.query.by;
    
    if (op) {
      switch(op) {
        case 'count':
          ReservationController.countRvs(res, {user: (req as any).user.sub, status: status});
          break
        case 'countdep':
          ReservationController.countRvs(
            res, {status: status, dep: (req as any).user.dep}
          );
          break;
      }
    } else {
      switch(by) {
        case 'dep':
          ReservationController.findRvs(res, {dep: (req as any).user.dep, status: status});
          break;
        default:
          ReservationController.findRvs(res, {user: (req as any).user.sub, status: status});
          break;
      }
    }
  }

  /////////////////////////////////////////////////
  ////////////////// CREATE ///////////////////////
  /////////////////////////////////////////////////

  newReservation(req: Request, res: Response) {
    const temp = {
      reason: req.body.reason,
      startDate: req.body.startDate + 'T00:00:00+0000',
      endDate: req.body.endDate + 'T00:00:00+0000',
      startTime: ReservationController.timeToDate(req.body.startTime),
      endTime: ReservationController.timeToDate(req.body.endTime),
      code: req.body.code,
      sequence: req.body.sequence,
      status: "pending",
      user: (req as any).user.sub,
      room: req.body.room,
    };
    
    const newReserv = new ReservationModel(temp);

    newReserv.findOverlappingReservations((err: any, result: any[]) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }

      if (result.length !== 0) {
        return res.status(422).send({message: "overlapping-reservation"});
      }
      
      newReserv.save((err, item) => {
        if (err) {
          return res.status(500).send({message: err.message});
        }
        res.send(item);
      });
      
    });
  }

  validateNew(): any[] {
    return [
      body("reason").optional().isString().not().isEmpty().trim().escape(),
      body("startDate").isISO8601(),
      body("endDate").isISO8601(),
      body("startTime").matches(/^\d{2}:\d{2}$/),
      body("endTime").matches(/^\d{2}:\d{2}$/),
      body("code").optional().isInt({min: 0}),
      body("sequence").optional().isInt({min: 0}),
      body("room").isString().custom(this.checkRoomExistence),
      this.checkValidationErrors
    ]
  }

  checkRoomExistence(value, obj): Promise<any> {
    return new Promise((accept, reject) => {
      RoomModel.countDocuments({_id: obj.req.body.room}, (err, result) => {
        if (err) {
          return reject({message: err.message});
        }
        if (result === 1) {
          return accept(true);
        }
        reject(`Room with id ${obj.req.body.room} not found`)
      });
    });
  }

  checkValidationErrors(req: Request, res: Response, next: NextFunction) {
    const errors: Result = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).send(errors.array());
    }
    next();
  }

  //////////////////////////////////////////////////
  /////////////////// UPDATE ///////////////////////
  //////////////////////////////////////////////////

  // it is possible to update only the status field
  updateReservation(req: Request, res: Response) {
    const newStatus = req.body.status;
    const reserv = (req as any).reserv;

    const callback = (err, result) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }

      if (result) {
        // should not add a notification when the user (all) is updating
        // a reservation that belongs to himself
        if (reserv.user.toString() !== (req as any).user.sub) {
          RoomModel.findById(reserv.room, "name", (err, room) => {
            if (err) {
              return res.status(500).send({message: err.message})
            }

            // create a notification
            let temp: string;
            switch(result.status) {
              case 'approved':
                temp = 'aprovada';
                break;
              case 'removed':
                temp = 'removida';
                break;
              default:
                temp = 'rejeitada';
                break;
            }

            const reasonTemp = req.body.reason ? `Motivo: ${req.body.reason}.` : null;
            const msg = `Reserva no espaço '${room.name}' ${temp}.${reasonTemp ? " " + reasonTemp : ""}`;

            UserModel.findById(reserv.user, (err, userTemp) => {
              if (err) {
                return res.status(500).send({message: err.message})
              }
              
              // insert a notification in the user's notifications list
              userTemp.notifications.push({message: msg, status: "unread"});
              userTemp.save((err) => {
                if (err) {
                  return res.status(500).send({message: err.message})
                }
                return res.send(result);
              })
            });
          });
        } else {
          return res.send(result);
        }
      }
    };

    if (reserv.status === 'pending' && newStatus === 'removed') {
      return ReservationModel.findByIdAndDelete(reserv._id, callback);
    }

    ReservationModel.findByIdAndUpdate({_id: reserv._id}, {status: newStatus}, {new: true}, callback);
  }

  validateUpdate(req: Request, res: Response, next: NextFunction) {

    const newStatus: string = req.body.status;
    if (newStatus !== "approved" && newStatus !== "removed") {
      return res.status(401).send({message: `invalid status: ${newStatus}`});
    }
    
    const user = (req as any).user;

    ReservationModel.findById(req.params.id, (err, reserv) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }

      if (reserv.status === "removed") {
        return res.status(401).send({message: "reservation already removed"});
      }

      (req as any).reserv = reserv;
      
      if (reserv.user.toString() === user.sub
          && (reserv.status === "approved" || reserv.status === "pending")
          && newStatus === "removed") {
        return next();
      }

      if (user.role === "auth") {
        return res.status(401).send({message: "user not authorized"});
      }

      if (reserv.status === "approved" && newStatus === "approved") {
        return res.send({message: "reservation already approved"});
      }

      RoomModel.findById(reserv.room, "department", (err, room) => {
        if (err) {
          return res.status(500).send({message: err.message});
        }

        DepartmentModel.findById(room.department, "user", (err, dep) => {
          if (err) {
            return res.status(500).send({message: err.message});
          }
          
          if (dep.user.toString() !== user.sub) {
            return res.status(401).send({message: "user not authorized"});
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

    ReservationModel.findOne({_id: id, user: (req as any).user.sub}, (err, reserv) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      
      if (!reserv) {
        return res.status(401).send({message: "reservation-not-found"});
      }
      
      if (reserv.status === "pending") {
        reserv.remove((err) => {
          if (err) {
            return res.status(500).send({message: err.message});
          }
          res.send(reserv);
        });
        
      } else {
        res.status(401).send({message: "user not authorized"});
      }
    });
  }

}
