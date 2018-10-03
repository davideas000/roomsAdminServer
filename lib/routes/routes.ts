import { Request, Response, NextFunction, Application } from 'express';
import * as jwt from 'jsonwebtoken';
import * as expressJwt from 'express-jwt';
import { body } from 'express-validator/check';

import { config } from './../config/config';
import { UserModel } from './../models/user.model';
import { ReservationModel } from '../models/reservation.model';

import { ReservationController } from '../controllers/reservation.controller';
import { NotificationController } from '../controllers/notification.controller';
import { UserController } from '../controllers/user.controller';
import { RoomController } from '../controllers/room.controller';
import { DepartmentController } from '../controllers/department.controller';

export class Routes {

  private reservationController = new ReservationController();
  private notificationController = new NotificationController();
  private userController = new UserController();
  private roomController = new RoomController();
  private departmentController = new DepartmentController();
  
  routes(app: Application): void {
    
    const authGuard = expressJwt({
      secret: config.secret
    });
    
    app.get('/', (req: Request, res: Response) => {
      res.send({message: 'Api endpoint'});
    });

    app.post('/login', (req: Request, res: Response) => {
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
              const token = jwt.sign({role: user.role}, config.secret, {
                expiresIn: EXPIRES_IN,
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
              return res.send({success: true, token: token, profile: tempUser, expiresIn: EXPIRES_IN});
            }

            if (result === false) {
              return res.status(401).send({success: false, message: 'wrong-password'})
            }
            
            if (result.message) {

              res.status(500).send({success: false, message: err.message})
            }
          });
        });
    });
    
    app.route('/reservations')
      .get(authGuard, this.reservationController.getReservations);

    app.post(
      '/reservation',
      authGuard,
      this.reservationController.validateNew(),
      this.reservationController.newReservation);
    
    app.route('/reservation/:id')
      .put(authGuard, body('reason').optional().escape().trim(),
           this.reservationController.validateUpdate,
           this.reservationController.updateReservation)
      .delete(authGuard, this.reservationController.deleteReservation);

    app.get('/notifications', authGuard, this.notificationController.getCurrentUserNotifications);
    app.put('/notifim', authGuard, this.notificationController.markNotificationsAsRead);

    app.get('/profile', authGuard, this.userController.getCurrentUser);

    app.get('/rtypes', authGuard, this.roomController.getTypes);

    app.get('/departments', authGuard, this.departmentController.getDeps);
    
    // FIXME: english grammar
    // recives the following values as query paramenters:
    // dateStart, dateEnd, timeStart, timeEnd,
    // width, length, capacity, type and department.
    // dateStart, dateEnd, timeStart and timeEnd are optional
    // but all of them must be specified or none at all,
    // width, length, capacity, type and department are also
    // optional (any of them can be specified).
    app.get('/rsearch', authGuard,
            this.roomController.getExcludes,
            this.roomController.findRoomsAndExclude);
    
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
