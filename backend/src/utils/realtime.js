let webSocketServer = null;

export function setWebSocketServer(server) {
  webSocketServer = server;
}

export function broadcast(type, payload = {}) {
  if (!webSocketServer) return;
  const message = JSON.stringify({ type, ...payload });
  for (const client of webSocketServer.clients) {
    if (client.readyState === 1) client.send(message);
  }
}
