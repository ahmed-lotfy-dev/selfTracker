import { Hono } from "hono"
import { authMiddleware } from "../../middleware/middleware"
import { encodeBase64 } from "hono/utils/encode"
import { v2 as cloudinary } from "cloudinary"

const imageRouter = new Hono()

imageRouter.use(async (_c, next) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
  await next()
})

imageRouter.use(authMiddleware)

imageRouter.post("/upload", async (c) => {
  const body = await c.req.json()
  const image = body["image"]
  console.log({image})
  if (!image) {
    return c.json({ message: "No image provided" }, 400)
  }

  try {
    // Upload the image to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      resource_type: "auto",
      upload_preset: "fitnes-app-pictures",
    })

    return c.json({ success: true, imageUrl: result.secure_url })
  } catch (error) {
    console.error("Upload failed:", error)
    return c.json(
      { message: "Upload failed", error: (error as Error).message },
      500
    )
  }
})

imageRouter.post("/delete", async (c) => {
  const body = await c.req.json()
  const imageLink = body["imageLink"]
  console.log(imageLink)

  if (!imageLink) {
    return c.json({ message: "No image link provided" }, 400)
  }

  const match = imageLink.match(/\/v\d+\/(.+)\.\w+$/)
  const publicId = match ? match[1] : null

  if (!publicId) {
    return c.json({ message: "Invalid Cloudinary image URL" }, 400)
  }

  if (imageLink) {
    try {
      const results = await cloudinary.uploader.destroy(publicId)
      console.log(results)
      return c.json(results)
    } catch (error) {
      console.error(error)
      return c.json({ message: "Error deleting image" }, 500)
    }
  }
  return c.json({ message: "No image link provided" }, 400)
})

export default imageRouter
