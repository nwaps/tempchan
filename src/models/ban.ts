/*                             BAN.TS
  Defines the data model for ip bans
*/

import { Schema, model } from "mongoose";

export interface db_ban {
    ip: string;
    ban_end_date: Date;
};

const ban_schema = new Schema<db_ban>({
    ip: { type: String, required: true },
    ban_end_date: { type: Date, required: true },
});

export const ban_model = model<db_ban>('Ban', ban_schema);