import * as mongoose from "mongoose";
import { App } from './app';
import { config } from '../config/config';

const app = new App().app;

const PORT = process.env.PORT || 3000;

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoURL, {useNewUrlParser: true});
const db = mongoose.connection;

db.on('error', () => {
  console.error("mongo connection error, make sure that mongo service is running");
});

db.once('open', () => {
  console.log("mongo connection successfull");
});


app.listen(PORT, () => console.log(`server running at http://localhost:${PORT}`));
