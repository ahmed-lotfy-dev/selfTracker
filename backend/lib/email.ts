import { Resend } from "resend"

export const sendEmail = async (email: string, token: string, type: string) => {
  const resend = new Resend("re_Z1wF35wP_GhDsCqmyMLGHnGgy719qGf4F")
  try {
    let subject = ""
    let text = ""

    switch (type) {
      case "activate":
        subject = "Verify your email"
        text = `Click the link to verify your email: ${process.env.BASE_URL}/api/auth/verify-email?token=${token}`
        break
      case "reset":
        subject = "Reset your password"
        text = `Click the link to reset your password: ${process.env.BASE_URL}/api/auth/reset-password?token=${token}`
        break
      case "welcome":
        subject = "Welcome to our service!"
        text = "Thank you for signing up! We’re excited to have you on board."
        break
      default:
        throw new Error("Invalid email type")
    }

    const response = await resend.emails.send({
      from: "admin@ahmedlotfy.dev",
      to: email,
      subject,
      text,
    })

    console.log(`Email sent to ${email} with token ${token}`)
    console.log(response)
  } catch (error) {
    console.error("Failed to send email:", error)
  }
}
