/*                            FORM_PARSER.TS
  This is the middleware responsible for parsing the raw body data of incoming
  HTTP requests and formatting the data into a json object which can be accessed
  at endpoints through the req.body member. This piece of middleware is crucial
  for the functionality of the server, as express does not support body parsing
  by default. 
*/

import { NextFunction, Request, Response } from "express";

export default (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'POST' || !req.busboy) {
        return next();
    }

    // For every standard text field of the request body, simply add it to
    // req.body as a json member
    const fields : any = {};
    req.busboy.on("field", (name, value) => {
        fields[name] = value;
    })

    req.busboy.on("finish", () => {
        req.body = fields;
        next();
    });

    req.busboy.on("error", (error) => {
        res.status(400).json(error);
    });
};