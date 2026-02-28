import { Request, Response, NextFunction } from 'express';
import * as meetingService from './meeting.service';

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { title, isScheduled, startsAt, allowGuests } = req.body;
        const meeting = await meetingService.createMeeting(userId, {
            title, isScheduled, startsAt, allowGuests,
        });
        res.status(201).json({ success: true, data: meeting });
    } catch (err) { next(err); }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const meeting = await meetingService.getMeeting(req.params.code);
        res.json({ success: true, data: meeting });
    } catch (err) { next(err); }
};

export const join = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { guestName, guestEmail } = req.body;
        const result = await meetingService.joinMeeting(req.params.code, userId, guestName, guestEmail);
        res.json({ success: true, data: result });
    } catch (err) { next(err); }
};

export const admit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const hostUserId = req.user!.id;
        const { participantId } = req.body;
        const result = await meetingService.admitParticipant(req.params.code, participantId, hostUserId);
        res.json({ success: true, data: result });
    } catch (err) { next(err); }
};

export const reject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const hostUserId = req.user!.id;
        const { participantId } = req.body;
        const result = await meetingService.rejectParticipant(req.params.code, participantId, hostUserId);
        res.json({ success: true, data: result });
    } catch (err) { next(err); }
};

export const start = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const hostUserId = req.user!.id;
        const result = await meetingService.startMeeting(req.params.code, hostUserId);
        res.json({ success: true, data: result });
    } catch (err) { next(err); }
};

export const end = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const result = await meetingService.endMeeting(req.params.code, userId);
        res.json({ success: true, data: result });
    } catch (err) { next(err); }
};

export const lock = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const hostUserId = req.user!.id;
        const result = await meetingService.toggleLock(req.params.code, hostUserId);
        res.json({ success: true, data: result });
    } catch (err) { next(err); }
};

export const validate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const meeting = await meetingService.validateMeetingAccess(req.params.code);
        res.json({ success: true, data: meeting });
    } catch (err) { next(err); }
};

export const waitingList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const hostUserId = req.user!.id;
        const list = await meetingService.getWaitingParticipants(req.params.code, hostUserId);
        res.json({ success: true, data: list });
    } catch (err) { next(err); }
};
