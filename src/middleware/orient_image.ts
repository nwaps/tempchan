/*                             ORIENT_IMAGE.TS
  Middleware responsible for using the mogrify application to orient the request
  body image
*/

import { spawn } from 'child_process';
import { NextFunction, Request, Response } from 'express';
import { chat_res } from '../models/chat_response';
import { get_extension } from './form_parser';

export default (req: Request, res: Response, next: NextFunction) => {
    const err_response: chat_res = {
        message: '',
        data: null,
    }
    const file_path = req.body.data.image;
    if (!file_path) {
        return next();
    }
    try {
        const extension = get_extension(file_path);
        if (extension === '.jpg' || extension === '.jpeg') {
            var process = spawn("mogrify", ['-auto-orient', file_path]);
            process.on("close", () => {
                next();
            });
        } else {
            next();
        }
    } catch(err) {
        console.log(`orient_image_err:\n${err}`);
        err_response.message = 'server_error';
        res.status(500).json(err_response);
    }
}