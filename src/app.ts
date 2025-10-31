import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import appConfig from './configs/index.config';
import appRouter from './routers/api/index.router';
import * as path from 'path';
import { engine } from 'express-handlebars';
import webRouter from './routers/web/index.web.router';
import hbsEngineConfigOptions from './configs/hbs.config';
import connectLiveReload from "connect-livereload";
import cookieParser from 'cookie-parser';
import { attachUserFromJwtCookie } from './middlewares/web-auth';

const app = express();

const APP_PREFIX = appConfig.app.prefix || '/api';

const isProd = process.env.NODE_ENV === "production";
const isDev = process.env.NODE_ENV === 'development';

const viewsPath = isProd
    ? path.resolve(__dirname, "views")
    : path.resolve("src", "views");

function createApp(): express.Express {
    if (isDev) {
        app.use(connectLiveReload({ port: 35729 }));   
    }

    app.set('views', viewsPath);
    app.set('view engine', 'hbs');
    app.engine('hbs', engine(hbsEngineConfigOptions));

    // Middlewares
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static('public'));

    app.use(morgan('short'));
    app.use(cors());
    app.use(cookieParser());
    app.use(attachUserFromJwtCookie);
    
    if (isDev) {
        app.use(helmet({ contentSecurityPolicy: false }));
        // กัน cache หน้า HTML ใน dev ด้วย
        app.use((req, res, next) => {
            res.set('Cache-Control', 'no-store');
            next();
        });
    } else {
        app.use(helmet());
    }

    console.log('=============================================');
    // API Router
    app.use(APP_PREFIX, appRouter);
    app.use("/", webRouter);
    return app;
}

export default createApp;