/*                              PROXY_CHECK.TS
  Middleware responsibile for detecting if incoming post requests are being
  sent from behind a proxy, and blocking the request if the proxy matches a
  banned proxy specified in config.json.
*/

import { NextFunction, Request, Response } from "express";

export default (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'POST') {
        return next();
    }

    // TODO Implement ip2proxy check

    next();
};