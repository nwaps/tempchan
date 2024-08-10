/*                              DEBUG_ECHO.TS
  This is a very simple piece of optional middleware which will print out the
  contents of each request as it arrives to the server.
*/

import { NextFunction, Request, Response } from "express";

export default (req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    console.log(`PARAMS: ${JSON.stringify(req.params)}`);
    console.log(`BODY: ${JSON.stringify(req.body)}`);
    next();
};