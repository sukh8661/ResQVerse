function createWebSocketConnection() {
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const baseUrl = apiBaseUrl || window.location.origin;
  const wsUrl = `${baseUrl.replace(/^https:/, "wss:").replace(/^http:/, "ws:")}/ws`;
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
