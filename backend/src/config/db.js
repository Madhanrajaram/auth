import mongoose from "mongoose";

export const dbConnect = async () => {
  const connectionString = process.env.DB_CONNECT;

  if (!connectionString) {
    throw new Error("DB_CONNECT is not set in the environment.");
  }

  const uri = new URL(connectionString);
  const uriDatabase = uri.pathname.split("/").filter(Boolean)[0];
  const databaseName = process.env.DB_NAME || uriDatabase;

  if (!databaseName || databaseName.includes("/")) {
    throw new Error(
      "Set DB_NAME to a valid MongoDB database name or include one in DB_CONNECT.",
    );
  }

  await mongoose.connect(connectionString, { dbName: databaseName });
  console.log(`db connected: ${mongoose.connection.name}`);
};
