import { Request, Response, NextFunction, Application } from 'express';
import { body } from 'express-validator/check';

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
    
    app.get('/', (req: Request, res: Response) => {
      res.send({message: 'Api endpoint'});
    });

    app.post('/login', this.userController.login);
    
    app.route('/reservations')
      .get(this.userController.authGuard, this.reservationController.getReservations);

    app.post(
      '/reservation',
      this.userController.authGuard,
      this.reservationController.validateNew(),
      this.reservationController.newReservation);
    
    app.route('/reservation/:id')
      .put(this.userController.authGuard, body('reason').optional().escape().trim(),
           this.reservationController.validateUpdate,
           this.reservationController.updateReservation)
      .delete(this.userController.authGuard, this.reservationController.deleteReservation);

    app.get('/notifications', this.userController.authGuard, this.notificationController.getCurrentUserNotifications);
    app.put('/notifim', this.userController.authGuard, this.notificationController.markNotificationsAsRead);

    app.get('/profile', this.userController.authGuard, this.userController.getCurrentUser);

    app.get('/rtypes', this.userController.authGuard, this.roomController.getTypes);

    app.get('/departments', this.userController.authGuard, this.departmentController.getDeps);
    
    // FIXME: english grammar
    // recives the following values as query paramenters:
    // dateStart, dateEnd, timeStart, timeEnd,
    // width, length, capacity, type and department.
    // dateStart, dateEnd, timeStart and timeEnd are optional
    // but all of them must be specified or none at all,
    // width, length, capacity, type and department are also
    // optional (any of them can be specified).
    app.get('/rsearch', this.userController.authGuard,
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
