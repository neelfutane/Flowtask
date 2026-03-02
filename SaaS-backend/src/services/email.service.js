const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendWelcomeEmail = async (user) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "FlowTask <onboarding@resend.dev>",
      to: [user.email],
      subject: "Welcome to FlowTask! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 12px 16px; border-radius: 12px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">⚡ FlowTask</span>
            </div>
          </div>
          
          <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
            <h1 style="color: #1e293b; margin-top: 0; font-size: 24px;">Welcome to FlowTask, ${user.name}! 🎉</h1>
            
            <p style="color: #475569; font-size: 16px;">
              Your account has been created successfully. You're now ready to start managing your projects and tasks with ease.
            </p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
              <h3 style="color: #1e293b; margin-top: 0; font-size: 16px;">Here's what you can do:</h3>
              <ul style="color: #475569; padding-left: 20px;">
                <li style="margin-bottom: 8px;">📁 Create and manage projects</li>
                <li style="margin-bottom: 8px;">✅ Organize tasks with Kanban boards</li>
                <li style="margin-bottom: 8px;">👥 Collaborate with your team</li>
                <li style="margin-bottom: 8px;">📊 Track progress in real-time</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
                 style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Get Started
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #94a3b8; font-size: 14px;">
            <p>Need help? Reply to this email or visit our help center.</p>
            <p style="margin-top: 20px;">
              © ${new Date().getFullYear()} FlowTask. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error };
    }

    console.log("Welcome email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: error.message };
  }
};
