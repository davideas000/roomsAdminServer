import { Request, Response, NextFunction, Application } from 'express';
import { User } from './../models/user-model';

export class Routes {
  
  routes(app: Application): void {
    app.get('/', (req: Request, res: Response) => {
      res.send("app endpoint");
    });

    app.post('/login', (req: Request, res: Response) => {
      const email = req.body.email;
      const password = req.body.password;
      console.log(`email: ${email}, password: ${password}`); // $$$$dddd
      User.find(
        {email: email}, "name displayName email photoURL role",
        (err, user) => {
          if (err) {
            return res.status(500).send({message: err.message});
          }
          if (user) {
            res.send(user);
          }
        });
    });
    
  }
  
}
