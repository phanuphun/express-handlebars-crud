export { };

declare global {
    namespace Express {
        interface Request {
            user?: { id: string; username: string; role?: string };
        }
    }
}

declare module 'express-serve-static-core' {
    interface Request {
        user?: { id: string; username: string; role?: string };
    }
}
