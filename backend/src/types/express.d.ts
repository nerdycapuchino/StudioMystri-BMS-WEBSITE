/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload } from 'jsonwebtoken';

// Augment Express types for our project
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
            };
        }
    }
}

// Override ParamsDictionary so req.params.id is `string`, not `string | string[]`
declare module 'express-serve-static-core' {
    interface ParamsDictionary {
        [key: string]: string;
    }
}

export { };
