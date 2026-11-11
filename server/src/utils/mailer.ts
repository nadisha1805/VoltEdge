import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return null;
};

export const sendEmailNotification = async (options: EmailOptions): Promise<boolean> => {
  try {
    const transporter = getTransporter();
    const fromAddress = process.env.SMTP_FROM || 'VOLTEDGE Electronics <no-reply@voltedge-electronics.com>';

    if (!transporter) {
      console.log(`\n======================================================`);
      console.log(`[EMAIL NOTIFICATION (Dev Log Fallback)]`);
      console.log(`To: ${options.to}`);
      console.log(`From: ${fromAddress}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Content:\n${options.text || options.subject}`);
      console.log(`======================================================\n`);
      return true;
    }

    await transporter.sendMail({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log(`[Email Sent] To: ${options.to} | Subject: ${options.subject}`);
    return true;
  } catch (error) {
    console.error('[Email Notification Error]', error);
    return false;
  }
};

export const emailTemplates = {
  welcome: (name: string) => {
    const clientBaseUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
    return {
    subject: 'Welcome to VOLTEDGE Electronics! ⚡',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background-color: #0f172a; padding: 16px; text-align: center; border-radius: 6px;">
          <h1 style="color: #38bdf8; margin: 0; font-size: 24px;">VOLTEDGE Electronics</h1>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 14px;">Powering Your Digital World.</p>
        </div>
        <div style="padding: 24px 0;">
          <h2 style="color: #1e293b;">Hello ${name},</h2>
          <p style="color: #475569; line-height: 1.6;">Thank you for registering at VOLTEDGE Electronics. Your account is now active and ready to explore our premium electronic showroom.</p>
          <p style="color: #475569; line-height: 1.6;">Enjoy our latest gadgets, smartphones, gaming laptops, and home audio devices with express delivery and official brand warranties.</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${clientBaseUrl.replace(/\/$/, '')}/shop" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">Explore The Showroom</a>
          </div>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
          VOLTEDGE Electronics | Plot 42, Digital Corridor, Cyber City, Bangalore - 560100
        </div>
      </div>
    `,
  };
  },

  passwordReset: (name: string, resetLink: string) => ({
    subject: 'VOLTEDGE Electronics - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1e293b;">Password Reset Request</h2>
        <p style="color: #475569;">Hello ${name},</p>
        <p style="color: #475569;">We received a request to reset your VOLTEDGE Electronics account password. Click the link below to set a new password. This link is valid for 1 hour.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 10px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 13px;">If you did not request this password reset, please ignore this email or contact support.</p>
      </div>
    `,
  }),

  orderConfirmation: (orderNumber: string, customerName: string, totalAmount: number, items: any[]) => ({
    subject: `Order Confirmed: ${orderNumber} - VOLTEDGE Electronics`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background-color: #0f172a; padding: 16px; text-align: center; border-radius: 6px;">
          <h1 style="color: #38bdf8; margin: 0;">VOLTEDGE Electronics</h1>
          <p style="color: #94a3b8; margin: 4px 0 0 0;">Order Confirmation</p>
        </div>
        <div style="padding: 20px 0;">
          <h2 style="color: #1e293b;">Thank you for your order, ${customerName}!</h2>
          <p style="color: #475569;">Your order <strong>#${orderNumber}</strong> has been received and is being processed.</p>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 16px 0;">
            <h3 style="margin-top: 0; color: #334155; font-size: 16px;">Order Summary:</h3>
            <ul style="padding-left: 20px; color: #475569;">
              ${items.map(item => `<li>${item.quantity}x ${item.productName} - ₹${item.totalPrice.toLocaleString('en-IN')}</li>`).join('')}
            </ul>
            <p style="font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 0;">Total Amount: ₹${totalAmount.toLocaleString('en-IN')}</p>
          </div>
          <p style="color: #475569;">You can track this order and download your invoice at any time in your customer portal.</p>
        </div>
      </div>
    `,
  }),

  paymentSuccess: (orderNumber: string, paymentId: string, amount: number) => ({
    subject: `Payment Successful for Order ${orderNumber} ⚡`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #16a34a;">Payment Confirmed!</h2>
        <p style="color: #475569;">We have received your payment of <strong>₹${amount.toLocaleString('en-IN')}</strong> for Order <strong>#${orderNumber}</strong>.</p>
        <p style="color: #64748b; font-size: 14px;">Transaction Reference / Payment ID: <code>${paymentId}</code></p>
        <p style="color: #475569;">Our showroom warehouse team is now packaging your order for shipment.</p>
      </div>
    `,
  }),

  orderStatusUpdate: (orderNumber: string, newStatus: string) => ({
    subject: `Order #${orderNumber} Update: ${newStatus}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1e293b;">Order Status Updated</h2>
        <p style="color: #475569;">Your order <strong>#${orderNumber}</strong> status is now: <strong style="color: #2563eb;">${newStatus}</strong>.</p>
        <p style="color: #475569;">Log into your VOLTEDGE Customer Dashboard to view tracking details.</p>
      </div>
    `,
  }),
};

