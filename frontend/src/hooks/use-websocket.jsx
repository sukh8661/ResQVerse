import { useEffect, useRef, useState } from "react";
import { createWebSocketConnection } from "@/lib/websocket";
function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const socket = useRef(null);
  useEffect(() => {
    socket.current = createWebSocketConnection();
    socket.current.onopen = () => {
      setIsConnected(true);
    };
    socket.current.onclose = () => {
      setIsConnected(false);
    };
    socket.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, []);
  const sendMessage = (message) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(message));
    }
  };
  return {
    isConnected,
    lastMessage,
    sendMessage
  };
}
export {
  useWebSocket
};
