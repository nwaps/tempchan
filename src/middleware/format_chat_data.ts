/*                            FORMAT_CHAT_DATA.TS
  Responsible for creating a formatted data object from the request body which
  will be used for creating a chat message in the database. The members which
  will be populated by this function will be:
  - data.board
  - data.chat
  - data.body
  - data.name
  - data.date
  - data.post_id
  - data.ip
  - data.user_agent
  - data.image
  - data.image_filename
  - data.image_filesize
  - data.thumb
*/

import { NextFunction, Request, Response } from "express";
import { message_model } from "../models/message";
import { chat_res } from "../models/chat_response";
import { get_user_ip } from "./ip_check";

export default (req: Request, res: Response, next: NextFunction) => {
    const response: chat_res = {
        message: '',
        data: null,
    }
    if (!req.body.board) {
        response.message = 'missing_board';
        return res.status(400).json(response);
    }

    if (!req.body.body && !req.body.file) {
        response.message = 'empty_post';
        return res.status(400).json(response);
    }

    if (!req.body.data) {
        req.body.data = {}
    }

    message_model.findOne({}, {}, { sort: { 'post_id': -1 } })
    .exec()
    .then((most_recent) => {
        req.body.data.post_id = most_recent ? most_recent.post_id + 1 : 0;
        req.body.data.board = req.body.board;
        req.body.data.chat = !req.body.chat || req.body.chat === undefined ? "General" : req.body.chat;
        req.body.data.name = !req.body.name || req.body.name === undefined ? "Anonymous" : req.body.name;
        req.body.data.body = req.body.body;
        req.body.data.date = Date.now();
        req.body.data.ip = get_user_ip(req);
        req.body.data.user_agent = req.headers['user-agent'];
        if (req.body.file) {
            req.body.data.image = req.body.file.file_path;
            req.body.data.image_filename = req.body.file.orig_filename;
            req.body.data.image_filesize = req.body.file.file_size;
            req.body.data.thumb = req.body.file.thumb_path;
        }
    
        next();
    });
}