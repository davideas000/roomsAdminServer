import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as cors from "cors";

import * as morgan from 'morgan';

import { Application } from 'express';

import { Routes } from './routes/routes';
import { config } from '../config/config';

export class App {
  
  app: Application;
  routes: Routes;
  
  constructor() {
    this.app = express();
    this.config();
    this.routes = new Routes();
    this.routes.routes(this.app);
  }

  config(): void {
    this.app.use(cors());
    this.app.use(bodyParser.json());
    // this.app.use(morgan('dev')); // $$$$dddd
  }
  
}
