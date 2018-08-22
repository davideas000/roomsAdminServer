import { Request, Response } from 'express';
import { ReservationModel } from './../models/reservation.model';

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
    console.log("body", temp);  // $$$$dddd
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
  
}
