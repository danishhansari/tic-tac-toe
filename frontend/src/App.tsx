import { useState } from "react";
import { produce } from "immer";

function App() {
  const [turn, setTurn] = useState<number>(0);
  const [ticTacToeState, setTicTacToeState] = useState<Array<Array<number>>>([
    [-1, -1, -1],
    [-1, -1, -1],
    [-1, -1, -1],
  ]);

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

  return (
    <>
      <main className="flex w-full h-screen bg-zinc-900 text-gray-100 justify-center items-center">
        <div className="grid grid-cols-3">
          {ticTacToeState.map((row, i) => {
            return (
              <div>
                {row.map((cell, j) => {
                  return (
                    <button
                      className={`w-[100px] h-[100px] border-b last-of-type:border-b-0 text-3xl border-white text-white flex items-center justify-center border-r `}
                      onClick={() => onCellClick(i, j)}
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

export default App;
