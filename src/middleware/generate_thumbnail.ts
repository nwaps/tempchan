/*                               GENERATE_THUMBNAIL.TS
  Middleware responsible for generating the thumbnail for the request
  image/video if present.
*/

import { spawn } from 'child_process';
import fs from 'fs';
import { categorize } from './format_img';
import { NextFunction, Request, Response } from 'express';
import { chat_res } from '../models/chat_response';

export default (req: Request, res: Response, next: NextFunction) => {
    const err_response: chat_res = {
        message: '',
        data: null,
    }
    const data = req.body.data;
    let command: string = '';
    let args: string[] = [];
    try {
        var category = data.image ? categorize(data.image) : "";
        if (category !== "image" && category !== "video") {
            // no image/video uploaded; we are finished
            return next();
        }

        // calculate width and height for thumbnail
        var scale = Math.min(250 / data.image_width, 100 / data.image_height, 1);
        var thumb_width = Math.round(scale * data.image_width);
        var thumb_height = Math.round(scale * data.image_height);

        // determine thumbnail path
        var thumb_extension = (category === "image" && data.image_transparent !== false) ? 'png' : 'jpg';

        // prepare command to generate thumbnail
        if (category === "video" || category === "image") {
            command = 'ffmpeg';
            args = ['-i', data.image];
            args = args.concat((
                '-y -s '+thumb_width+'x'+thumb_height+' -vframes 1 -f image2 -c:v '+(thumb_extension==='png'?'png':'mjpeg')+' -'
            ).split(' '));
        }
    } catch(e) {
        console.log('error in thumbnail creation code', e);
        err_response.message = 'thumbnail_error'
        return res.status(500).json(err_response);
    }

    try {
        var stderr = "";
        console.log(command);
        console.log(args);
        var process = spawn(command, args);
        // if (category === "image") {
        //     fs.createReadStream(data.image).on("error", function(e) {console.log(e);}).pipe(process.stdin.on("error", function(e) {console.log(e);}));
        // }

        if (category === 'image') {
            const readStream = fs.createReadStream(data.image);
            readStream.on('error', (e) => console.log(e));
            process.stdin.on('error', (e) => console.log(e));
            readStream.pipe(process.stdin as unknown as NodeJS.WritableStream);
        }

        process.stdout.on("error", function(e) {console.log(e);}).pipe(fs.createWriteStream(data.thumb) as unknown as NodeJS.WritableStream);
        process.stderr.on("error", function(e) {console.log(e);}).on("data", function(data) {stderr += data;});
        process.on("close", function(code) {
            if (code !== 0) {
                console.log('thumbnail command returned error', code, command, stderr);
                err_response.message = 'thumbnail_corrupt_img_file';
                return res.status(400).json(err_response);
            }
            return next();
        });
    } catch(e) {
        console.log('failed to spawn thumbnail process', e);
        err_response.message = 'thumbnail_error';
        return res.status(500).json(err_response);
    }
};
