import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null

export const sendEmail = async ({ to, subject, html }: { to: string, subject: string, html: string }) => {
  try {
    if (!resend) {
      console.log("------------------------------------------")
      console.log(`[SIMULATED EMAIL] To: ${to}`)
      console.log(`Subject: ${subject}`)
      console.log(`Content: ${html.substring(0, 100)}...`)
      console.log("------------------------------------------")
      return { success: true, simulated: true }
    }

    const { data, error } = await resend.emails.send({
      from: "WellnessOS <notifications@wellnessos.com>",
      to,
      subject,
      html,
    })

    if (error) {
       console.error("Resend Email Error:", error)
       return { error }
    }

    return { data, success: true }
  } catch (error) {
    console.error("Notification Service Error:", error)
    return { error }
  }
}

/**
 * Templates
 */
export const getBookingConfirmationTemplate = (salonName: string, serviceName: string, startTime: string) => `
  <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
    <h1 style="color: #7c3aed;">Appointment Confirmed!</h1>
    <p>Your session at <strong>${salonName}</strong> has been secured.</p>
    <div style="background: #f9f8ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Service:</strong> ${serviceName}</p>
      <p style="margin: 5px 0;"><strong>When:</strong> ${startTime}</p>
    </div>
    <p style="color: #666; font-size: 14px;">We look forward to seeing you. Please arrive 5 minutes early.</p>
  </div>
`

export const getCancellationTemplate = (salonName: string, serviceName: string, startTime: string) => `
  <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #fecaca; border-radius: 20px;">
    <h1 style="color: #ef4444;">Appointment Cancelled</h1>
    <p>Your session for <strong>${serviceName}</strong> at <strong>${salonName}</strong> has been cancelled.</p>
    <p style="color: #666; font-size: 14px;">If this was a mistake, please visit our booking page to reschedule.</p>
  </div>
`
