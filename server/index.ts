import type { ServerWebSocket } from "bun";

type MessageType = Buffer | string | ArrayBuffer | Blob;

interface LastUser {
  name: string;
  socket: ServerWebSocket<unknown>;
  sign: number;
}

interface Game {
  players: LastUser[];
  board: Array<Array<number>>;
  id: string;
  turn: number;
}
let lastUser: LastUser | undefined = undefined;
const games: Game[] = [];

const reloadGame = async () => {
  const file = Bun.file("games.json");
  const fileExists = await file.exists();
  if (fileExists) {
    const content = await file.bytes();
    const text = new String(content).toString();
    const data = JSON.parse(text);
    games.push(...data);
  }
};

const saveGame = async () => {
  await Bun.write("games.json", JSON.stringify(games));
};

const handleJoinTypeMessage = async (
  name: string,
  ws: ServerWebSocket<unknown>
): Promise<void> => {
  if (lastUser === undefined) {
    lastUser = { name, socket: ws, sign: Math.random() > 0.5 ? 0 : 1 };
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
      players: [
        lastUser,
        { name, socket: ws, sign: lastUser.sign === 0 ? 1 : 0 },
      ],
      board: [
        [-1, -1, -1],
        [-1, -1, -1],
        [-1, -1, -1],
      ],
      id: Math.random().toString(36).substring(7),
      turn: Math.random() > 0.5 ? 0 : 1,
    };
    games.push(game);
    await saveGame();
    ws.send(
      JSON.stringify({ type: "found_match", data: { game_id: game.id } })
    );
    lastUser.socket.send(
      JSON.stringify({ type: "found_match", data: { game_id: game.id } })
    );
  }
};

const handleGamePlay = (
  game_id: string,
  player: LastUser,
  i: number,
  j: number
) => {};

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
          handleJoinTypeMessage(data.name, ws);
        }
        if (data.type === "init_sync_game") {
          const game_id = data.game_id;
          const game = games.find((g) => g.id === game_id);

          if (game) {
            game.players.forEach((player) => {
              player.socket.send(
                JSON.stringify({
                  type: "sync_game",
                  data: {
                    board: game.board,
                    turn: game.turn,
                  },
                })
              );
            });
          } else {
            ws.send(
              JSON.stringify({
                type: "error",
                data: {
                  message: "Game not found, Please check your game id",
                },
              })
            );
          }
        }
      }
    },
    async open(ws: ServerWebSocket) {
      console.log("New connection open");
    },
  },
});
reloadGame();
