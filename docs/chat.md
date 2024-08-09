# Chat API
This document provides the documentation for the API endpoints, and socket structure dealing with chat functionality of the server.

## Route Endpoints

These are the HTTP endpoints for managing chat messages.

### Creation

```
method: POST
path: /chat
body: {
    name: string, optional
    body: string, optional if image present, required otherwise
    board: string, required
    chat: string, optional
    image: file, optional if body present, required otherwise
}
Response: {
    success: string
    id: int
}
```

Creates a chat message.

Message body:
- `name`: Alias of poster
- `body`: Message body
- `board`: Board to post the message to
- `chat`: Chat of board to post the message to, defaults to `"All"`
- `image`: Image to send along with the message

Response body:
- `success`: Success message
- `id`: id of new post

### Reading

```
method: GET
path: /chat/[BOARD]
response: Raw HTML
```

Retrieves the html for the chat page of the `BOARD` board.

```
method: GET
path: /data/[BOARD]
response: [
    {
        board: string
        name: string
        body: string
        chat: string
        count: int
        date: Date
        image: string
        image_filename: string
        image_filesize: string
        image_width: int
        image_height: int
        thumb: string
        identifier: string
    },
    ...
]
```

Retrieves a list of the current messages present in a chat

Response body:
- `board`: board the post belongs to
- `name`: alias of poster
- `body`: body of message
- `chat`: chat post belongs to
- `count`: post number
- `date`: date created
- `image`: absolute path to image stored on filesystem
- `image_filename`: filename of image
- `image_filesize`: size of image in bytes
- `image_width`: width of image in pixels
- `image_height`: height of image in pixels
- `thumb`: absolute path to image thumbnail stored on filesystem
- `identifier`: unique id of post in database

**note**: Kotchan and Livechan have the ability to customize the fields returned by this endpoint by specifying the fields in the config file. Is this something we want?

## Socket Interface

This is an overview the socket interface used by the server to inform connected clients of new posts in real time.

### Server Side Listeners

`subscribe`: Event denotes a client has made a connection to the server. Once a subscribe event has been found, the socket should then join the appropriate room, which is associated with the board the client is connected to.

`unsubscribe`: Event denotes a client has disconnected from the server.

### Server Side Emitters

`chat`: Event denotes a chat message has been made in a given room. Should only be emitted to the room associated with the board the message belongs to. Along with the event, all relavent message data should be sent as well.

### Client Side Listeners

`chat`: Event denotes a new chat message has been sent to the room the client is connected to. The chat data should be read and used to populate a new post on the UI.

### Client Side Emitters

`subscribe`: Event denotes a client has connected to a chat room. Along with the event, the appropriate chat room should also be sent.

`unsubscribe`: Event denotes the client has disconnected from the chat room