import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as morgan from 'morgan';

import { Application } from 'express';

import { Routes } from './routes/routes';
import { config } from '../config/config';

class App {
  
  app: Application;
  routes: Routes;
  
  constructor() {
    this.app = express();
    this.config();
    this.routes = new Routes();
    this.routes.routes(this.app);
    this.mongoSetup();
  }

  config(): void {
    this.app.use(bodyParser.json());
    this.app.use(morgan('dev'));
  }

  mongoSetup(): void {
    mongoose.Promise = global.Promise;
    mongoose.connect(config.mongoUrl, {useNewUrlParser: true});
  }
}

export default new App().app;
