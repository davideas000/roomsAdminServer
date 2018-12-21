import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/user.controller';

export class AdminRouter {
  private router = Router();

  private usrController = new UserController();

  constructor() {
    this.config();
  }

  private config() {
    this.router.use(this.usrController.adminGuard);
  }

  get routes() {
    return this.router;
  }
}
