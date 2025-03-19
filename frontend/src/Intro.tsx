import React, { useContext, useEffect, useState } from "react";
import { WebSocketContext } from "./WebSocketProvider";
import { useNavigate } from "react-router-dom";

const Intro: React.FC = () => {
  const [name, setName] = useState("");
  const socket = useContext(WebSocketContext);
  const [waiting, setWaiting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        const data = event.data;
        if (data) {
          const message = JSON.parse(data);
          if (message.type === "join") {
            const messageData = message.data;
            setWaiting(messageData.status === "wait");
          }
          if (message.type === "found_match") {
            const messageData = message.data;
            const gameId = messageData.game_id;
            navigate(`/game/${gameId}`)
          }
        }
      };
    }
  }, []);

  const onJoin = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: "join", name }));
    }
  };
  return (
    <main className="bg-zinc-900 flex h-screen items-center justify-center text-gray-100">
      {waiting ? (
        <div className="flex flex-col items-center justify-center">
          <div>
            <img src="/bean.gif" alt="Loading" width={200} />
          </div>
          <p>Please wait while we pair you with someone</p>
        </div>
      ) : (
        <div className="max-w-[400px] w-full flex flex-col gap-3 border p-4 bg-indigo-600/4 rounded-md">
          <h1 className="text-xl font-semibold mb-2">Tic Tac Toe</h1>
          <input
            type="text"
            placeholder="Enter your name"
            className="border pl-4 text-md py-2 rounded-lg bg-indigo-300/5"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            onClick={onJoin}
            className="bg-indigo-800 py-2 rounded-xl mt-2 hover:bg-indigo-900 transition-colors"
          >
            Join
          </button>
        </div>
      )}
    </main>
  );
};
export default Intro;
