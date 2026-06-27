import http from "node:http";
import { WebSocketServer } from "ws";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/db.js";
import { seedDatabase } from "./seed/seedDatabase.js";
import { setWebSocketServer } from "./utils/realtime.js";

async function startServer() {
  await connectDatabase();

  if (env.seedDatabase) {
    await seedDatabase();
  }

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: "/ws" });
  setWebSocketServer(wss);

  wss.on("connection", (socket) => {
    socket.send(JSON.stringify({ type: "connected", message: "ResQVerse realtime connected" }));
  });

  server.listen(env.port, () => {
    console.log(`ResQVerse backend running on http://127.0.0.1:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Backend startup failed:", error);
  process.exit(1);
});
