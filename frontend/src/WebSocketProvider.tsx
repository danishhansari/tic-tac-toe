import { createContext, useMemo } from "react";

export const WebSocketContext = createContext<WebSocket | undefined>(undefined);
const WebSocketProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const socket = useMemo(() => new WebSocket("ws://localhost:3001"), []);
  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
