import { Queue } from "bullmq"
import { connection } from "../redis"

export const clickQueue = new Queue("click-processing", {
  connection,
})