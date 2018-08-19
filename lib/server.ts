import { App } from './app';
import { config } from '../config/config';

const app = new App(config.mongoUrl).app;

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`server running at http://localhost:${PORT}`));
