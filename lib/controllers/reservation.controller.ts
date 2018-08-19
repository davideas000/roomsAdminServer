import { Request, Response } from 'express';
import { ReservationModel } from './../models/reservation.model';

export class ReservationController {
  
  getCurrentUserApprovedReservations(req: Request, res: Response) {
    ReservationModel.find({userId: (req as any).user.sub, status: "aproved"}, (err, reservations: any[]) => {
      if (err) {
        return res.send({success: false, message: err.message});
      }
      res.send(reservations);
    });
  }
  
}
