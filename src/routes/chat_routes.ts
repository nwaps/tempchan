/*                           CHAT_ROUTES.TS
  Implements the API endpoints for chat functionality (creating, posting, etc)
  Documentation: /server/docs/chat.md
*/
import add_chat from '../add_chat';
import format_chat_data from '../middleware/format_chat_data';
import { Router } from 'express';
import emit_chat from '../sockets/emit_chat';
const router = Router();

router.post("/chat", format_chat_data, async (req, res) => {
    try {
        // Add message to database
        await add_chat(req.body.data);
        
        // Emit message to all concurrent clients
        emit_chat(req.body.data.board, req.body.data);

        // TODO: Place logic here to emit to other misc clients (discord webhook for example)

        res.status(200).json({ message: "Success", data: req.body.data });
    } catch(err) {
        res.status(400).json({ message: err, data: null });
    }
});

router.get("/chat/:board", (req, res, next) => {
    res.json({msg: "CHAT ROOM"})
});

router.get("/data/:board", (req, res, next) => {
    res.json({msg: "CHAT DATA"});
});

export default router;