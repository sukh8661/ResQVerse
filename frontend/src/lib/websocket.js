function createWebSocketConnection() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  const socket = new WebSocket(wsUrl);
  socket.onopen = () => {
    console.log("Connected to WebSocket");
  };
  socket.onclose = () => {
    console.log("WebSocket connection closed");
  };
  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
  return socket;
}
export {
  createWebSocketConnection
};
