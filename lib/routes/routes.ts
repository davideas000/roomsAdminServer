import { Request, Response, NextFunction, Application } from 'express';
import * as jwt from 'jsonwebtoken';
import { User } from './../models/user-model';
import { config } from './../../config/config';

export class Routes {
  
  routes(app: Application): void {
    app.get('/', (req: Request, res: Response) => {
      res.send("app endpoint");
    });

    app.post('/login', (req: Request, res: Response) => {
      const email = req.body.email;
      const password = req.body.password;
      // console.log(`email: ${email}, password: ${password}`); // $$$$dddd
      User.findOne(
        {email: email}, "name displayName email photoURL role",
        (err, user) => {
          if (err) {
            return res.status(500).send({message: err.message});
          }
          if (user) {
            // console.log("user", user); // $$$$dddd
            const token = jwt.sign({role: user.role}, config.secret, {
              expiresIn: "7d",
              subject: user._id.toString()
            });
            return res.send({success: true, token: token, profile: user});
          }

          res.send({success: false, message: "user-not-found"})
        });
    });
    
  }
  
}
