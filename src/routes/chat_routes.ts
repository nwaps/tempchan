/*                           CHAT_ROUTES.TS
  Implements the API endpoints for chat functionality (creating, posting, etc)
  Documentation: /server/docs/chat.md
*/

import { Router } from 'express';
const router = Router();

router.post("/chat/", (req, res, next) => {
  res.json(req.body);
});

router.get("/chat/:board", (req, res, next) => {
  res.json({msg: "CHAT ROOM"})
});

router.get("/data/:board", (req, res, next) => {
  res.json({msg: "CHAT DATA"});
});

export default router;