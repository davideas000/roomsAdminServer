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
  
}