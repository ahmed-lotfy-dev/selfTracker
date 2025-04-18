import { Hono } from "hono"
import { encodeBase64 } from "hono/utils/encode"
import { v2 as cloudinary } from "cloudinary"
import { db } from "../db"
import { eq } from "drizzle-orm"
import { users } from "../db/schema"
import { updateUser } from "better-auth/api"

const imageRouter = new Hono()

imageRouter.use(async (_c, next) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
  await next()
})

imageRouter.post("/upload", async (c) => {
  const body = await c.req.json()
  const image = body["image"]
  if (!image) {
    return c.json({ message: "No image provided" }, 400)
  }

  try {
    const result = await cloudinary.uploader.upload(image, {
      resource_type: "auto",
      upload_preset: "fitnes-app-pictures",
    })

    const updatedUserImage = await db
      .update(users)
      .set({
        image: result.secure_url,
      })
      .where(eq(users.id, users.id))
      .returning({
        image: users.image,
      })

    return c.json({ success: true, imageUrl: updatedUserImage[0].image })
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
