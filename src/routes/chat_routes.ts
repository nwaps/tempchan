/*                           CHAT_ROUTES.TS
  Implements the API endpoints for chat functionality (creating, posting, etc)
  Documentation: /server/docs/chat.md
*/
import { Router } from 'express';
import path from 'path';
import config from '../../config';
import format_chat_data from '../middleware/format_chat_data';
import emit_chat from '../sockets/emit_chat';
import add_chat from '../add_chat';
import { chat_res } from '../models/chat_response';
import { db_message, message_model } from '../models/message';
import orient_image from '../middleware/orient_image';
import format_img from '../middleware/format_img';
import generate_thumbnail from '../middleware/generate_thumbnail';
const router = Router();

router.post("/chat",
            format_chat_data,
            orient_image,
            format_img,
            generate_thumbnail,
            async (req, res) => {
    const response: chat_res = {
        message: "",
        data: null
    };
    try {
        // Add message to database
        await add_chat(req.body.data);
        
        // Emit message to all concurrent clients
        emit_chat(req.body.data.board, req.body.data);

        // TODO: Place logic here to emit to other misc clients (discord webhook for example)

        response.message = "success";
        response.data = req.body.data;
        res.status(200).json(response);
    } catch(err) {
        console.log(err);
        response.message = "server_failure";
        response.data = null;
        res.status(500).json(response);
    }
});

router.get('/', (req, res) => {
    res.redirect('/chat/home');
});

router.get("/chat/:board", (req, res) => {
    if (config.boards.indexOf(req.params.board) === -1 && req.params.board !== 'home') {
        res.sendFile(path.join(global.ROOT, '/src/pages/404.html'));
    }
    res.sendFile(path.join(global.ROOT, '/src/pages/index.html'));
});

router.get("/data/:board", async (req, res) => {
    const response: chat_res = {
        message: "",
        data: null
    };
    try {
        const message_response = await message_model.find({ board: req.params.board }, {}, { sort: { post_id: -1 }});
        const messages: db_message[] = message_response.map((doc) => {
            const ret: db_message = {
                board: doc.board,
                name: doc.name,
                body: doc.body,
                chat: doc.chat,
                post_id: doc.post_id,
                date: doc.date,
                image: doc.image,
                image_filename: doc.image_filename,
                image_filesize: doc.image_filename,
                image_width: doc.image_width,
                image_height: doc.image_height,
                thumb: doc.thumb,
                original_poster: doc.original_poster,
                ip: doc.ip,
                user_agent: doc.user_agent,
            };
    
            return ret;
        });

        response.message = "success";
        response.data = messages;
        res.status(200).json(response);
    } catch(err) {
        response.message = "server_failure";
        response.data = null;
        res.status(500).json(response);
    }
});

export default router;