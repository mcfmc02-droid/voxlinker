export async function fetchProductImageFromGoogle(title: string) {
  try {
    const query = encodeURIComponent(title)

    const res = await fetch(
      `https://serpapi.com/search.json?q=${query}&tbm=isch&api_key=${process.env.SERP_API_KEY}`
    )

    const data = await res.json()

    const image = data.images_results?.[0]?.original

    if (!image) return null

    return image

  } catch (err) {
    console.error("GOOGLE IMAGE ERROR:", err)
    return null
  }
}