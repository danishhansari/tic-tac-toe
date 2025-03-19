import type { ServerWebSocket } from "bun";

type MessageType = Buffer | string | ArrayBuffer | Blob;

interface LastUser {
  name: string;
  socket: ServerWebSocket<unknown>;
}

interface Game {
  players: LastUser[];
  board: Array<Array<number>>;
  id: string;
}
let lastUser: LastUser | undefined = undefined;
const games: Game[] = [];

const handleJoin = (name: string, ws: ServerWebSocket<unknown>): void => {
  if (lastUser === undefined) {
    lastUser = { name, socket: ws };
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
    const game: Game = {
      players: [lastUser, { name, socket: ws }],
      board: [
        [-1, -1, -1],
        [-1, -1, -1],
        [-1, -1, -1],
      ],
      id: Math.random().toString(36).substring(7),
    };
    games.push(game);
    ws.send(
      JSON.stringify({ type: "found_match", data: { game_id: game.id } })
    );
    lastUser.socket.send(
      JSON.stringify({ type: "found_match", data: { game_id: game.id } })
    );
  }
};

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
        const data = JSON.parse(message);
        if (data.type === "join") {
          handleJoin(data.name, ws);
        }
      }
    },
    async open(ws: ServerWebSocket) {
      console.log("New connection open");
    },
  },
});
