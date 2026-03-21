import { Worker } from "bullmq"
import { connection } from "../lib/redis"
import { prisma } from "../lib/prisma"

new Worker(
  "click-processing",
  async (job) => {

    const click = await prisma.click.findUnique({
      where: { id: job.data.clickDbId }
    })

    if (!click) return

    // analytics
    // fraud detection
    // update metrics

  },
  {
    connection,
  }
)