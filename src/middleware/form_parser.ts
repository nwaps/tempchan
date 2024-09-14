/*                            FORM_PARSER.TS
  This is the middleware responsible for parsing the raw body data of incoming
  HTTP requests and formatting the data into a json object which can be accessed
  at endpoints through the req.body member. This piece of middleware is crucial
  for the functionality of the server, as express does not support body parsing
  by default. 
*/

import path from 'path';
import fs from 'fs';
import { NextFunction, Request, Response } from "express";
import { chat_res } from "../models/chat_response";

interface file_upload {
    file_path: string,
    thumb_path: string,
    orig_filename: string,
    file_size: number,
}

export default (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'POST' || !req.busboy) {
        return next();
    }
    const err_response: chat_res = {
        message: '',
        data: null,
    }

    // For every standard text field of the request body, simply add it to
    // req.body as a json member
    const fields: any = {};
    req.busboy.on('field', (name, value) => {
        fields[name] = value;
    })

    // Save up to 1 file on disk and save its metadata for processing later down
    // the middleware pipeline
    let found_file: boolean = false;
    let orig_filename: string = '';
    let file_path: string = '';
    let thumb_path: string = '';
    let file_stream: fs.WriteStream;
    let file_promise: Promise<number | string>;
    req.busboy.on('file', (field, file: NodeJS.ReadableStream, info) => {
        try {
            // Only allow 1 file upload per request
            if (!found_file && info.filename) {
                const new_name = unique_filename(info.filename);
                orig_filename = info.filename;
                file_path = path.join(__dirname, '../../../public/tmp/uploads', new_name);
                thumb_path = path.join(__dirname, '../../../public/tmp/thumb', new_name);
                file_stream = fs.createWriteStream(file_path);

                // Write main file
                if (file_stream) {
                    file.pipe(file_stream as unknown as NodeJS.WritableStream);
                }

                file_promise = new Promise<number | string>((resolve, reject) => {
                    file.on('limit', () => {
                        reject('exceeded_max_filesize');
                    });
                    file.on('end', () => {
                        file_stream?.end();
                    });
                    file_stream?.on('finish', () => {
                        resolve(file_stream?.bytesWritten || 0);
                    });
                    file_stream?.on('error', reject);
                });

                found_file = true;
            } else {
                file.resume();
            }
        } catch (err: any) {
            err_response.message = err.message;
            return res.status(400).json(err_response);
        }
    });

    req.busboy.on('finish', async () => {
        try {
            req.body = fields;

            if (found_file) {
                // If file has been saved, save its metadata to the request body
                const file_size = await file_promise;
                if (typeof file_size === 'string') {
                    err_response.message = file_size;
                    return res.status(400).json(err_response);
                }

                if (file_size > 0) {
                    const upload: file_upload = {
                        file_path: file_path,
                        thumb_path: thumb_path,
                        orig_filename: orig_filename,
                        file_size: file_size,
                    }
                    req.body.file = upload;
                } else {
                    // Dont allow empty files
                    fs.unlinkSync(file_path);
                    req.body.file = null;
                }
            } else {
                req.body.file = null;
            }

            next();
        } catch (err: any) {
            err_response.message = err.message;
            res.status(400).json(err_response);
        }
    });

    req.busboy.on('error', (error) => {
        console.log(error);
        err_response.message = 'parsing_failure';
        res.status(500).json(err_response);
    });
};

export const unique_filename = (filename: string) => {
    const ext = filename.slice(filename.lastIndexOf("."))
    return Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
}

export const get_extension = (path: string) => {
    const i = path.lastIndexOf('.');
    return (i < 0) ? '' : path.slice(i + 1).toLowerCase();
}