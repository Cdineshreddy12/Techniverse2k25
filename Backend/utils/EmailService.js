import dotenv from 'dotenv';
dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;
console.log('brevo key',BREVO_API_KEY);
export const sendUserCredentials = async (userData) => {
  const { email, name, plainPassword } = userData;

  console.log('Attempting to send email to:', email);

  const data = {
    sender: {
      name: "Techniverse2025",
      email: SENDER_EMAIL
    },
    to: [{
      email: email,
      name: name
    }],
    subject: "Your Techniverse 2025 Registration Details",
    htmlContent: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Techniverse 2025</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f6f9fc;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-family: 'Segoe UI', Arial, sans-serif;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px 40px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="text-align: center;">
                        <h1 style="color: #1a73e8; margin: 0; font-size: 28px; font-weight: bold;">Welcome to Techniverse 2025!</h1>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 20px 40px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="padding: 0 0 20px 0;">
                        <p style="color: #202124; font-size: 16px; line-height: 1.5; margin: 0;">Dear <span style="color: #1a73e8; font-weight: 600;">${name}</span>,</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 0 0 20px 0;">
                        <p style="color: #202124; font-size: 16px; line-height: 1.5; margin: 0;">Your offline registration has been successfully created. Here are your login credentials:</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Credentials Box -->
              <tr>
                <td style="padding: 0 40px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px; border: 1px solid #dee2e6;">
                    <tr>
                      <td style="padding: 20px;">
                        <p style="margin: 0 0 10px 0; color: #202124; font-size: 16px;">
                          <span style="color: #1a73e8; font-weight: 600;">Email:</span> 
                          <span style="background: white; padding: 4px 8px; border-radius: 4px; margin-left: 8px;">${email}</span>
                        </p>
                        <p style="margin: 0; color: #202124; font-size: 16px;">
                          <span style="color: #1a73e8; font-weight: 600;">Password:</span> 
                          <span style="background: white; padding: 4px 8px; border-radius: 4px; margin-left: 8px;">${plainPassword}</span>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Features List -->
              <tr>
                <td style="padding: 30px 40px;">
                  <p style="color: #202124; font-size: 16px; margin: 0 0 15px 0;">With these credentials, you can:</p>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="padding: 8px 0;">
                        <p style="margin: 0; color: #202124; font-size: 16px;">
                          <span style="color: #1a73e8; margin-right: 10px;">●</span> Login to your account
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;">
                        <p style="margin: 0; color: #202124; font-size: 16px;">
                          <span style="color: #1a73e8; margin-right: 10px;">●</span> View your registered events and workshops
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f8f9fa; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="color: #5f6368; font-size: 14px; line-height: 1.5;">
                        <p style="margin: 0 0 10px 0;">For any assistance, please contact our support team.</p>
                        <p style="margin: 0;">Best regards,<br><span style="color: #1a73e8; font-weight: 600;">Team Techniverse</span></p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`
  };

  try {
    console.log('Making request to Brevo API...');
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Brevo API Error:', responseData);
      throw new Error(responseData.message || 'Failed to send email');
    }

    console.log('Email sent successfully:', responseData);
    return { success: true, messageId: responseData.messageId };
  } catch (error) {
    console.error('Email Service Error:', error);
    throw error;
  }
};