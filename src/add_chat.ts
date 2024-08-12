/*                             ADD_CHAT.TS
  Implements the logic to create chat messages in the database
*/
import { message_model } from "./models/message"

export default async (data: any) => {
  const message = new message_model({
    board: data.board,
    name: data.name,
    body: data.body,
    chat: data.chat,
    post_id: data.post_id,
    image: null,
    image_filename: null,
    image_filesize: null,
    image_width: null,
    image_height: null,
    thumb: null,
    date: data.date,
  });

  await message.save();

  // TODO Delete older messages based on max history length in config
}