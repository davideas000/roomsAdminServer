import { Request, Response } from "express";
import { UserModel } from "../models/user.model";

export class UserController {
  
  getCurrentUser(req: Request, res: Response) {
    UserModel.findById((req as any).user.sub, "name displayName email photoURL role", (err, user) => {
      if (err) {
        return res.status(500).send({message: err.message});
      }
      res.send(user);
    });
  }
  
}
