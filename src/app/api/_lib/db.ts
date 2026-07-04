let connection: Promise<void> | null = null;

export async function ensureMongo() {
  if (!connection) {
    connection = import("../../../../backend/dist/db/mongoose.js").then(({ connectMongo }) => connectMongo());
  }
  return connection;
}
