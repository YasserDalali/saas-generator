import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

class EmailService {
  async sendEmail(to: string, subject: string, html: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL || "onboarding@resend.dev",
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error("Email error:", error);
        return { success: false, error };
      }

      console.log("Email sent:", data);
      return { success: true, data };
    } catch (error) {
      console.error("Email service error:", error);
      return { success: false, error };
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    const subject = "Welcome to our SaaS!";
    const html = `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for joining our SaaS platform. We're excited to have you on board!</p>
      <p>If you have any questions, feel free to reach out to us.</p>
    `;
    
    return this.sendEmail(to, subject, html);
  }

  async sendPasswordResetEmail(to: string, resetToken: string) {
    const subject = "Password Reset Request";
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
    `;
    
    return this.sendEmail(to, subject, html);
  }
}

export default new EmailService(); 