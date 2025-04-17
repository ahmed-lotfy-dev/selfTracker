import { Resend } from "resend"

interface EmailType {
  email: string
  subject: string
  text: string
}

export const sendEmail = async ({ email, subject, text }: EmailType) => {
  const resend = new Resend("re_Z1wF35wP_GhDsCqmyMLGHnGgy719qGf4F")
  try {
    const response = await resend.emails.send({
      from: "admin@ahmedlotfy.dev",
      to: email,
      subject,
      text,
    })
  } catch (error) {
    console.error("Failed to send email:", error)
  }
}
