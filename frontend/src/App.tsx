import { BrowserRouter, Route, Routes } from "react-router-dom";
import Intro from "./Intro";
import WebSocketProvider from "./WebSocketProvider";

const App: React.FC = () => {
  return (
    <>
      <WebSocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Intro />} />
          </Routes>
        </BrowserRouter>
      </WebSocketProvider>
    </>
  );
};

export default App;
