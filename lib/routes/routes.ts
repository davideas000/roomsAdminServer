import { Request, Response, NextFunction, Application } from 'express';
import * as jwt from 'jsonwebtoken';
import * as expressJwt from 'express-jwt';
import { body } from 'express-validator/check';

import { config } from './../../config/config';
import { UserModel } from './../models/user.model';
import { ReservationModel } from '../models/reservation.model';

import { ReservationController } from '../controllers/reservation.controller';
import { NotificationController } from '../controllers/notification.controller';

export class Routes {

  private reservationController = new ReservationController();
  private notificationController = new NotificationController();
  
  routes(app: Application): void {
    
    const authGuard = expressJwt({
      secret: config.secret
    });
    
    app.get('/', (req: Request, res: Response) => {
      res.send({message: "Api endpoint"});
    });

    app.post('/login', (req: Request, res: Response) => {
      const email = req.body.email;
      const password = req.body.password;

      if (!email || !password) {
        return res.send({success: false, message: 'missing-email-or-password'});
      }
      
      UserModel.findOne(
        {email: email},
        (err, user) => {
          if (err) {
            return res.status(500).send({success: false, message: err.message});
          }
          if (!user) {
            return res.send({success: false, message: "user-not-found"})
          }

          user.checkPassword(password, function(result) {
            if (result === true) {
              const token = jwt.sign({role: user.role}, config.secret, {
                expiresIn: "7d",
                subject: user._id.toString()
              });
              
              const tempUser = {
                _id: user._id,
                name: user.name,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                role: user.role
              };
              return res.send({success: true, token: token, profile: tempUser});
            }

            if (result === false) {
              return res.send({success: false, message: 'invalid-password'})
            }
            
            if (result.message) {

              res.status(500).send({success: false, message: err.message})
            }
          });
        });
    });
    
    app.route("/reservations")
      .get(authGuard, this.reservationController.getReservations);

    app.post(
      "/reservation",
      authGuard,
      this.reservationController.validateNew(),
      this.reservationController.newReservation);
    
    app.route("/reservation/:id")
      .put(authGuard, body("reason").optional().escape().trim(),
           this.reservationController.validateUpdate,
           this.reservationController.updateReservation)
      .delete(authGuard, this.reservationController.deleteReservation);

    app.get("/notifications", authGuard, this.notificationController.getCurrentUserNotifications);
    app.put("/notifim", authGuard, this.notificationController.markNotificationsAsRead);
    
    app.use((err: Error , req: Request, res: Response, next: NextFunction) => {
      if (err.name === 'UnauthorizedError') {
        return res.status(401).send({message: err.message});
      }
      next(err);
    });
    
    app.use((req: Request, res: Response) => {
      res.sendStatus(404);
    });
  }

}
