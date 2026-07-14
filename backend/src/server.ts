import { env } from "./config/env.js";
import { connectMongo } from "./db/mongoose.js";
import { app } from "./app.js";

await connectMongo();

const server = app.listen(env.PORT, () => {
  console.log(`Zenivra backend listening on http://localhost:${env.PORT}`);
});

const shutdown = async () => {
  server.close(() => process.exit(0));
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
