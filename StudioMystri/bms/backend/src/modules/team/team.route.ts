import { Router } from 'express';
import * as ctrl from './team.controller';
import { validate } from '../../middleware/validate';
import { reportConversationSchema, sendMessageSchema } from './team.schema';
import { upload } from '../../middleware/upload';

export const teamRouter = Router();
teamRouter.get('/channels', ctrl.channels);
teamRouter.get('/members', ctrl.members);
teamRouter.post('/channels', ctrl.create);
teamRouter.get('/messages', ctrl.messages);
teamRouter.post('/messages', validate(sendMessageSchema), ctrl.send);
teamRouter.delete('/messages/:id', ctrl.remove);
teamRouter.delete('/conversations/:channelId', ctrl.clearConversation);
teamRouter.post('/conversations/report', validate(reportConversationSchema), ctrl.reportConversation);
teamRouter.post('/messages/:id/attachments', upload.single('file'), ctrl.uploadAttachment);
teamRouter.post('/upload', upload.single('file'), ctrl.uploadAttachment);
