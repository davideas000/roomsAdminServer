import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';

export class NotificationController {
  
  getCurrentUserNotifications(req: Request, res: Response) {
    UserModel.findById((req as any).user.sub, "notifications", (err, user) => {
      if (err) {
        return res.status(500).send({success: false, message: err.message});
      }

      res.send({success: true, result: user.notifications});
    });
  }

  markNotificationsAsRead(req: Request, res: Response) {
    UserModel.findById((req as any).user.sub, "notifications", (err, user) => {
      if (err) {
        return res.status(500).send({success: false, message: err.message});
      }

      for(let notifi of user.notifications) {
        notifi.status = "read";
      }

      user.save((err) => {
        if (err) {
          return res.status(500).send({success: false, message: err.message});
        }
        
        res.send({success: true, message: "notifications modified"});
      });
      
    });
  }
  
}
