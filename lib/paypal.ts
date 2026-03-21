import axios from "axios"

const base =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com"

export async function getAccessToken() {
  const res = await axios.post(
    `${base}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      auth: {
        username: process.env.PAYPAL_CLIENT_ID!,
        password: process.env.PAYPAL_SECRET!,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  )

  return res.data.access_token
}

export async function sendPayout(email: string, amount: number) {
  const token = await getAccessToken()

  const res = await axios.post(
    `${base}/v1/payments/payouts`,
    {
      sender_batch_header: {
        sender_batch_id: `batch_${Date.now()}`,
        email_subject: "You received a payout!",
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: amount.toFixed(2),
            currency: "USD",
          },
          receiver: email,
          note: "Payment from VoxLinker",
          sender_item_id: `item_${Date.now()}`,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  )

  return res.data
}