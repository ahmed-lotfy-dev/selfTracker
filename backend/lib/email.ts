import { Resend } from "resend"

interface EmailType {
  email: string
  subject: string
  text: string
}

export const sendEmail = async ({ email, subject, text }: EmailType) => {
  const resend = new Resend(process.env.RESEND_API_KEY as string)
  try {
    const response = await resend.emails.send({
      from: "contact@ahmedlotfy.site",
      to: email,
      subject,
      text,
    })
  } catch (error) {
    console.error("Failed to send email:", error)
  }
}
