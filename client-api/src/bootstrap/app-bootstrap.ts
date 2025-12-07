import 'express-async-errors';

import cors from 'cors';
import express, { Express } from 'express';
import moment from 'moment';
import morgan from 'morgan';
import path from 'path';

import { init as initDatabase } from '../configuration/database.config';
import { init as initRouter } from '../configuration/router.config';
import { errorHandler } from '../middlewares/error-handler.middleware';

const origin = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*';

export class AppBootstrap {
    private app: Express;
    private corsOptions = {
        origin: origin,
        optionsSuccessStatus: 200,
    };

    constructor() {
        this.app = express();
    }

    getApp() {
        return this.app;
    }

    setMiddlewares() {
        this.app.use(cors(this.corsOptions));

        morgan.token('date', () => {
            return moment().format('DD/MM/YYYY hh:mm:ss a');
        });

        this.app.use(morgan(':method :url HTTP/:http-version :status - :response-time ms - :date'));

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        const assetsPath = path.join(__dirname, 'assets');
        this.app.use('/api/v1/legal/assets', express.static(path.join(__dirname, 'templates', 'assets')));

        return this;
    }

    setRoutes() {
        initRouter(this.app);

        return this;
    }

    setErrorHandler() {
        this.app.use(errorHandler);

        return this;
    }

    initDatabase() {
        initDatabase(process.env.DATABASE_URI!);

        return this;
    }

    listen() {
        const port = process.env.PORT;

        this.app.listen(port, () => {
            console.log(`App listening on port ${port}...`);
        });
    }

    static run() {
        new AppBootstrap().initDatabase().setMiddlewares().setRoutes().setErrorHandler().listen();
    }
}
