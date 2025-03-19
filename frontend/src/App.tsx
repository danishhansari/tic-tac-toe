import { BrowserRouter, Route, Routes } from "react-router-dom";
import Intro from "./Intro";
import WebSocketProvider from "./WebSocketProvider";
import TicTacToe from "./TicTacToe";

const App: React.FC = () => {
  return (
    <>
      <WebSocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Intro />} />
            <Route path="/game/:gameId" element={<TicTacToe />} />
          </Routes>
        </BrowserRouter>
      </WebSocketProvider>
    </>
  );
};

export default App;
