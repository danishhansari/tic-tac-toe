import type { ServerWebSocket } from "bun";

type MessageType = Buffer | string | ArrayBuffer | Blob;

interface LastUser {
  name: string;
  socket: ServerWebSocket<unknown>;
}

interface Game {
  players: LastUser[];
  board: Array<Array<string>>;
  id: string;
}
let lastUser: LastUser | undefined = undefined;
const games: Game[] = [];

Bun.serve({
  port: 3001,
  fetch(req, server) {
    if (server.upgrade(req)) {
      return;
    }
    return new Response("Upgrade failed", { status: 500 });
  },
  websocket: {
    async message(ws: ServerWebSocket, message: MessageType) {
      if (message && typeof message === "string") {
        console.log("Received message " + message);
        if (lastUser === undefined) {
          lastUser = { name: message, socket: ws };
          ws.send(
            JSON.stringify({
              type: "join",
              data: {
                status: "wait",
              },
            })
          );
          ws.send(JSON.stringify({ type: "starting", data: {} }));
        } else {
        }
      }
    },
    async open(ws: ServerWebSocket) {
      console.log("New connection open");
    },
  },
});
