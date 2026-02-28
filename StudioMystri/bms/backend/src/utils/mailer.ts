import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendResetPasswordEmail = async (email: string, resetLink: string, userName: string) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️ SMTP credentials are not configured. Cannot send email. The reset link is:', resetLink);
        return;
    }

    const mailOptions = {
        from: `"Studio Mystri BMS" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Studio Mystri BMS - Account Password Reset',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #1e293b; padding: 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Studio Mystri BMS</h1>
                </div>
                <div style="padding: 32px 24px;">
                    <h2 style="margin-top: 0; color: #0f172a;">Password Reset Request</h2>
                    <p>Hello <strong>${userName}</strong>,</p>
                    <p>A password reset or account provisioning request has been made for your Studio Mystri BMS account.</p>
                    <p>Please click the button below to set a new secure password:</p>
                    
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; text-transform: uppercase; font-size: 14px; letter-spacing: 0.5px;">Set New Password</a>
                    </div>
                    
                    <p style="font-size: 14px; color: #475569; margin-bottom: 8px;">Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #2563eb; background-color: #f1f5f9; padding: 12px; border-radius: 4px; font-size: 13px; margin-top: 0;">${resetLink}</p>
                    
                    <p style="margin-top: 24px;">This secure link is valid for <strong>24 hours</strong>.</p>
                </div>
                <div style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="font-size: 12px; color: #64748b; margin: 0;">If you did not request this, please ignore this email or contact the IT administrator immediately.</p>
                </div>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${email} (MessageId: ${info.messageId})`);
    } catch (error) {
        console.error(`❌ Failed to send email to ${email}:`, error);
        // We log it but do not throw to prevent crashing the API
    }
};
