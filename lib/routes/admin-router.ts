import { Router, Request, Response } from 'express';

export class AdminRouter {
  private router = Router();

  constructor() {
    this.config();
  }

  private config() {
  }

  get routes() {
    return this.router;
  }
}
