/*                              IP_CHECK.TS
  Determines the ip of the incoming request and blocks the request if the ip
  matches a banned ip or falls within a banned ip range.
*/

import { NextFunction, Request, Response } from "express";
import { ban_model } from "../models/ban";
import { chat_res } from "../models/chat_response";
import config from "../../config";

const recent_posts: any = {};

export default (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'POST') {
        return next();
    }

    const response: chat_res = {
        message: '',
        data: null
    }

    // Enforce cooldown
    const ip: string = get_user_ip(req);
    const now = new Date().getTime();
    if (recent_posts[ip] && recent_posts[ip]+config.POST_COOLDOWN > now) {
        response.message = 'cooldown_violation'
        return res.status(401).json(response);
    } else {
        recent_posts[ip] = now;
    }

    // Enforce ip ban
    ban_model.find({ ban_end_date:{'$gt': Date.now()} })
    .exec()
    .then((ban_list) => {
        let is_banned = false;
        for (var i = 0; i < ban_list.length; i++) {
            if (ip.indexOf(ban_list[i].ip) === 0) {
                is_banned = true;
                break;
            }
        }
        if (is_banned) {
            response.message = 'ban_violation';
            return res.status(401).json(response);
        }
        next();
    });
};

export const get_user_ip = (req: Request) => {
    let user_ip = req.headers['x-forwarded-for'];
    if (user_ip && typeof user_ip !== "string") {
        user_ip = user_ip[0];
    }
    if (typeof user_ip !== 'string' || user_ip == '' || user_ip == null) {
        user_ip = '255.255.255.255';
    }

    return user_ip;
};