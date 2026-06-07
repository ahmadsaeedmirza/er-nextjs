const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION! SHUTTING DOWN.....");
  process.exit(1);
});

const app = require("./app");

const dbConnectionString = process.env.DATABASE || "";
const DB = dbConnectionString.includes("<PASSWORD>")
  ? dbConnectionString.replace("<PASSWORD>", process.env.DATABASE_PASSWORD || "")
  : dbConnectionString;

if (!DB) {
  console.error("FATAL ERROR: DATABASE connection string is missing from env variables!");
  process.exit(1);
}

// NEW, CLEAN, SUPPORTED VERSION
mongoose
  .connect(DB)
  .then(() => console.log("Database connection is successful!"))
  .catch((err) => {
    console.error("DB Connection Error:", err);
    process.exit(1);
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`App running on port ${port}`);
});

// Real-time socket initialization
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:8000", "https://er-salon.vercel.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
  allowEIO3: true
});
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`Socket client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! SHUTTING DOWN.....");
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM RECEIVED. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated...!!!");
  });
});
