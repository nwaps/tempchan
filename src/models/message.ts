/*                              MESSAGE.TS
  Defines the data models for chat messages
*/

import { Schema, model } from "mongoose"

export interface idb_message {
    board: string;
    name: string;
    body: string;
    chat: string;
    post_id: number;
    date: Date;
    image: string;
    image_filename: string;
    image_filesize: string;
    image_width: number;
    image_height: number;
    thumb: string;
}

const message_schema = new Schema<idb_message>({
    board: { type: String, required: true },
    name: { type: String, required: true },
    body: { type: String, required: true },
    chat: { type: String, required: true},
    post_id: { type: Number, required: true, unique: true },
    date: { type: Date, required: true, default: Date.now },
    image: { type: String, required: false },
    image_filename: { type: String, required: false },
    image_filesize: { type: String, required: false },
    image_width: { type: Number, required: false },
    image_height: { type: Number, required: false },
    thumb: { type: String, required: false },
});

export const message_model = model<idb_message>('Message', message_schema);