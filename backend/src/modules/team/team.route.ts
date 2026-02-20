import { Router } from 'express';
import * as ctrl from './team.controller';
import { validate } from '../../middleware/validate';
import { sendMessageSchema } from './team.schema';
import { upload } from '../../middleware/upload';

export const teamRouter = Router();
teamRouter.get('/channels', ctrl.channels);
teamRouter.get('/messages', ctrl.messages);
teamRouter.post('/messages', validate(sendMessageSchema), ctrl.send);
teamRouter.delete('/messages/:id', ctrl.remove);
teamRouter.post('/messages/:id/attachments', upload.single('file'), ctrl.uploadAttachment);
