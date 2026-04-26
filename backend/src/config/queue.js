import { Queue } from "bullmq";

export const sosQueue = new Queue("sosQueue", {
  connection: {
    url: process.env.REDIS_URL
  }
});