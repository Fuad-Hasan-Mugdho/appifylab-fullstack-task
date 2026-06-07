#!/bin/sh
set -e

node - <<'NODE'
const net = require("net");
const databaseUrl = new URL(process.env.DATABASE_URL);
const host = databaseUrl.hostname;
const port = Number(databaseUrl.port || 5432);
const deadline = Date.now() + 30000;

function tryConnect() {
  const socket = net.createConnection({ host, port });
  socket.on("connect", () => {
    socket.end();
    process.exit(0);
  });
  socket.on("error", () => {
    socket.destroy();
    if (Date.now() > deadline) {
      console.error(`Database is not reachable at ${host}:${port}`);
      process.exit(1);
    }
    setTimeout(tryConnect, 1000);
  });
}

tryConnect();
NODE

./node_modules/.bin/prisma db push --skip-generate
node server.js
