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
  TODO:
  - data.ip
  - data.user_agent
*/

import { NextFunction, Request, Response } from "express";
import { message_model } from "../models/message";

export default async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.board) {
        return res.status(400).json({ msg: "Missing board" });
    }
    if (!req.body.data) {
        req.body.data = {}
    }

    // TODO throw error if no image and no body

    const most_recent = await message_model.findOne({}, {}, { sort: { 'post_id': -1 } }).exec();

    req.body.data.post_id = most_recent ? most_recent.post_id + 1 : 0;
    req.body.data.board = req.body.board;
    req.body.data.chat = !req.body.chat || req.body.chat === undefined ? "General" : req.body.chat;
    req.body.data.name = !req.body.name || req.body.name === undefined ? "Anonymous" : req.body.name;
    req.body.data.body = req.body.body;
    req.body.data.date = Date.now();

    next();
}