/*                              MESSAGE.TS
  Defines the data models for chat messages
*/

import { Schema, model } from "mongoose"

export interface db_message {
    board: string;
    name: string;
    body: string;
    chat: string;
    post_id: number;
    date: Date;
    image: string | null;
    image_filename: string | null;
    image_filesize: string | null;
    image_width: number | null;
    image_height: number | null;
    thumb: string | null;
    original_poster: boolean;
    ip: string;
    user_agent: string;
    from_discord: boolean;
}

const message_schema = new Schema<db_message>({
    board: { type: String, required: true },
    name: { type: String, required: true },
    body: { type: String, required: false },
    chat: { type: String, required: true},
    post_id: { type: Number, required: true, unique: true },
    date: { type: Date, required: true, default: Date.now },
    image: { type: String, required: false },
    image_filename: { type: String, required: false },
    image_filesize: { type: String, required: false },
    image_width: { type: Number, required: false },
    image_height: { type: Number, required: false },
    thumb: { type: String, required: false },
    original_poster: { type: Boolean, required: true },
    ip: { type: String, required: true },
    user_agent: { type: String, required: true },
    from_discord: {type: Boolean, required: false}
});

export const message_model = model<db_message>('Message', message_schema);