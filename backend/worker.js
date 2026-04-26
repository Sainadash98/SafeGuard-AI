import "dotenv/config";
import { Worker } from "bullmq";
import redis from "./src/config/redis.js";
import User from "./src/models/user.model.js";
import { sendAlert } from "./src/services/alert.service.js";

const workerConnection = {};

if (process.env.REDIS_URL) {
  try {
    const parsedUrl = new URL(process.env.REDIS_URL);
    workerConnection.host = parsedUrl.hostname;
    workerConnection.port = Number(parsedUrl.port);
    if (parsedUrl.username) workerConnection.username = parsedUrl.username;
    if (parsedUrl.password) workerConnection.password = parsedUrl.password;
  } catch (error) {
    console.error("Worker Redis URL parse error:", error);
  }
}

const worker = new Worker(
  "sosQueue",
  async job => {
    const { userId, message, riskLevel, lat, lng } = job.data;

    const user = await User.findById(userId);

    user.trustedContacts.forEach(contact => {
      sendAlert(contact, {
        message,
        location: { lat, lng },
        riskLevel
      });
    });

    await redis.set(
      `sos:${userId}`,
      JSON.stringify({ message, riskLevel })
    );

    console.log("SOS processed");
  },
  {
    connection: workerConnection
  }
);
console.log("REDIS URL:", process.env.REDIS_URL);
console.log("Worker running..."); 