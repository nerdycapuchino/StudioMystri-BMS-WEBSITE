import { Router } from 'express';
import * as ctrl from './meeting.controller';
import { verifyToken } from '../../middleware/auth';

export const meetingRouter = Router();

// Create a meeting (auth required)
meetingRouter.post('/', verifyToken, ctrl.create);

// Get meeting info (public — for join page)
meetingRouter.get('/:code', ctrl.get);

// Validate meeting is active (public)
meetingRouter.get('/:code/validate', ctrl.validate);

// Join meeting — supports auth + guest
meetingRouter.post('/:code/join', optionalAuth, ctrl.join);

// Start scheduled meeting (auth + host only)
meetingRouter.post('/:code/start', verifyToken, ctrl.start);

// End meeting (auth + host only)
meetingRouter.post('/:code/end', verifyToken, ctrl.end);

// Lock/unlock meeting (auth + host only)
meetingRouter.post('/:code/lock', verifyToken, ctrl.lock);

// Admit participant from waiting room (auth + host only)
meetingRouter.post('/:code/admit', verifyToken, ctrl.admit);

// Reject participant from waiting room (auth + host only)
meetingRouter.post('/:code/reject', verifyToken, ctrl.reject);

// Get waiting room list (auth + host only)
meetingRouter.get('/:code/waiting', verifyToken, ctrl.waitingList);

/**
 * Optional auth — attaches user if token present, allows guests through.
 */
function optionalAuth(req: any, res: any, next: any) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return verifyToken(req, res, next);
    }
    next();
}
