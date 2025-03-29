import { useCallback, useContext, useEffect, useState } from "react";
import { produce } from "immer";
import { useParams } from "react-router-dom";
import { WebSocketContext } from "./WebSocketProvider";

function TicTacToe() {
  const [turn, setTurn] = useState<number>(0);
  const [winner, setWinner] = useState<number>();
  const [error, setError] = useState<string>();
  const [ticTacToeState, setTicTacToeState] = useState<Array<Array<number>>>([
    [-1, -1, -1],
    [-1, -1, -1],
    [-1, -1, -1],
  ]);
  const { game_id } = useParams();
  const socket = useContext(WebSocketContext);

  const onCellClick = (row: number, column: number) => {
    console.log(row, column);
    setTicTacToeState(
      produce(ticTacToeState, (draft) => {
        if (ticTacToeState[row][column] !== -1) return;
        draft[row][column] = turn;
        setTurn(turn === 0 ? 1 : 0);
      })
    );
  };

  useEffect(() => {
    setTimeout(() => {
      if (socket && game_id) {
        socket.send(
          JSON.stringify({
            type: "init_sync_game",
            game_id: game_id,
          })
        );
        socket.onmessage = (event) => {
          const dataStr = event.data;

          if (dataStr) {
            const { data, type } = JSON.parse(dataStr);

            if (type === "sync_game") {
              setTicTacToeState(data.board);
              setTurn(data.turn);
            } else if (type === "error") {
              setError(data.message);
            } else {
              console.log("no data found");
            }
          }
        };
      }
    }, 1000);
  }, [socket, game_id]);

  const checkWinner = useCallback(() => {
    for (let i = 0; i < 3; i++) {
      if (
        ticTacToeState[i][0] === ticTacToeState[i][1] &&
        ticTacToeState[i][1] === ticTacToeState[i][2] &&
        ticTacToeState[i][0] !== -1
      ) {
        setWinner(ticTacToeState[i][0]);
        return;
      }
    }

    for (let i = 0; i < 3; i++) {
      if (
        ticTacToeState[0][i] === ticTacToeState[1][i] &&
        ticTacToeState[1][i] === ticTacToeState[2][i] &&
        ticTacToeState[0][i] !== -1
      ) {
        setWinner(ticTacToeState[0][i]);
        return;
      }

      if (
        ticTacToeState[0][0] === ticTacToeState[1][1] &&
        ticTacToeState[1][1] === ticTacToeState[2][2] &&
        ticTacToeState[0][0] !== -1
      ) {
        setWinner(ticTacToeState[0][0]);
        return;
      }

      if (
        ticTacToeState[0][2] === ticTacToeState[1][1] &&
        ticTacToeState[1][1] === ticTacToeState[2][0] &&
        ticTacToeState[0][2] !== -1
      ) {
        setWinner(ticTacToeState[0][2]);
        return;
      }
    }
  }, [ticTacToeState]);

  useEffect(() => {
    checkWinner();
  }, [checkWinner]);

if(error){
  return (
    <div className="w-full h-screen bg-black text-white">
      {error}
    </div>
  )
}

  return (
    <>
      <main className="flex w-full flex-col h-screen bg-zinc-900 text-gray-100 justify-center items-center">
        {winner !== undefined ? (
          <div className="text-white text-3xl">
            Winner is {winner === 0 ? "O" : "X"}
          </div>
        ) : (
          <div className="text-white text-3xl">
            Turn is {turn === 0 ? "O" : "X"}
          </div>
        )}

        <div className="grid grid-cols-3">
          {ticTacToeState.map((row, i) => {
            return (
              <div key={`row-${i}`}>
                {row.map((cell, j) => {
                  return (
                    <button
                      className={`w-[100px] h-[100px] border-b last-of-type:border-b-0 text-3xl border-white text-white flex items-center justify-center border-r `}
                      onClick={() => onCellClick(i, j)}
                      key={`cell-${i}-${j}`}
                    >
                      {cell === -1 ? "" : cell === 0 ? "O" : "X"}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}

export default TicTacToe;
