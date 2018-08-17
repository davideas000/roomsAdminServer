import { Request, Response, NextFunction, Application } from 'express';
import * as jwt from 'jsonwebtoken';
import * as expressJwt from 'express-jwt';

import { User } from './../models/user.model';
import { config } from './../../config/config';

export class Routes {
  
  routes(app: Application): void {
    
    const authGuard = expressJwt({
      secret: config.secret
    });
    
    app.get('/', (req: Request, res: Response) => {
      res.send("app endpoint");
    });

    app.post('/login', (req: Request, res: Response) => {
      const email = req.body.email;
      const password = req.body.password;
      if (!email || !password) {
        return res.send({success: false, message: 'missing-email-or-password'});
      }
      
      User.findOne(
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

    app.route('/reservation')
      .get(authGuard, (req: Request, res: Response) => {
        res.send('protected data sent from server');
      });

    app.use((err: Error , req: Request, res: Response, next: NextFunction) => {
      if (err.name === 'UnauthorizedError') {
        return res.status(401).send(err.message);
      }
      next(err);
    });
    
    app.use((req: Request, res: Response) => {
      res.sendStatus(404);
    });
  }
  
}
