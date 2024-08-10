# Tempchan
This repo serves as the home for a lightweight livechat service inspired by the [kotchan](https://github.com/cnsr/kotchan/tree/kotchan) and [livechan](https://github.com/emgram769/livechan-js) projects. The goal of this project is to provide a basic, yet easily maintainable and extendable template that may serve as the foundation of a more ambitious, feature rich project.

## Running
### Prerequisites:

- nodejs/npm

### Create a config file

Create a file named `config.ts` in the base of the repo. This file is responsible for specifying various environment variables used in the server, such as the port the server runs on. See [example_config.ts](./example_config.ts) for an example of how this file should be structured.

### Install the necesarry packages:

`npm i`

### Start the server:

`npm run start`

## Current Plans and Overview

In its current state, this server does nothing but start up. The first goal should be to get a functioning chat system working. Similar to Kotchan and Livechan, the chat system will follow the following design:

![image](./docs/img/chat_overview.png)

The implementation details surrounding the chat api endpoints and socket interface can be found in [chat.md](./docs/chat.md). The only aspect of this diagram not documented yet is the frontend client. Kotchan's frontend will most likely be salvaged as our frontend. However, this will neccessitate some cleanup.

## TODO

- Implement basic server-side text chat creation and reading in chat API

- Implement server-side user connection detection and chat forwarding through sockets

- Implement image support in chat API

- Implement security features in chat API
  - IP and range bans
  - Proxy bans
  - Server-side post cooldown
  - Word bans/replacement

- Make chat creation API endpoint(s) forward chat messages to discord webhook

- Port Kotchan front end code to work with server-side logic
  - (This will require cleanup that I don't quite know the scope of. At least, we'll have to modify the requests to the chat API to match our new server's design)

**note**: You can additionally checkout [TODO.txt](./TODO.txt) for disorganized notes about Kotchan and development plans