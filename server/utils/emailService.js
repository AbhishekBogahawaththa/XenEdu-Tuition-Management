const { Resend } = require('resend');

const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set');
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
};

const FROM_EMAIL = 'XenEdu Institute <onboarding@resend.dev>';

const sendCredentials = async ({
  studentName, studentEmail, parentName, parentEmail,
  admissionNumber, studentPassword, parentPassword,
}) => {
  const resend = getResend();
  if (!resend) { console.error('Resend not configured'); return; }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: studentEmail,
      subject: 'Welcome to XenEdu - Your Login Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
          <div style="background: #0d6b7a; padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #F5C518; margin: 0; font-size: 32px; font-weight: 800;">XenEdu</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;">A/L Tuition Management System</p>
          </div>
          <div style="background: #f9f9f9; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e0e0e0;">
            <h2 style="color: #0d6b7a;">Welcome, ${studentName}!</h2>
            <p style="color: #666; font-size: 14px;">Your registration has been approved. Here are your login credentials:</p>
            <div style="background: white; border-radius: 12px; padding: 24px; border: 2px solid #E8F5F0; margin-bottom: 20px;">
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; color: #888; font-size: 14px; width: 140px;">Admission No.</td>
                  <td style="padding: 8px 0; font-weight: 800; color: #0d6b7a; font-size: 16px;">${admissionNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #888; font-size: 14px;">Email</td>
                  <td style="padding: 8px 0; font-weight: 600; color: #2D2D2D; font-size: 14px;">${studentEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #888; font-size: 14px;">Password</td>
                  <td style="padding: 8px 0;">
                    <span style="background: #0d6b7a; color: white; padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 16px;">
                      ${studentPassword}
                    </span>
                  </td>
                </tr>
              </table>
            </div>
            <p style="color: #856404; font-size: 13px; background: #FFF9E6; padding: 12px; border-radius: 8px;">
              Important: Please change your password after your first login.
            </p>
            <div style="margin-top: 24px; text-align: center; color: #aaa; font-size: 12px;">
              XenEdu Mirigama | xenedu@gmail.com | 033-2242-2589
            </div>
          </div>
        </div>
      `,
    });
    console.log('Credentials email sent to student:', studentEmail);
  } catch (err) {
    console.error('Failed to send student email:', err.message);
  }

  if (parentPassword && parentEmail) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: parentEmail,
        subject: 'XenEdu - Parent Portal Access',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
            <div style="background: #0d6b7a; padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: #F5C518; margin: 0; font-size: 32px; font-weight: 800;">XenEdu</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;">A/L Tuition Management System</p>
            </div>
            <div style="background: #f9f9f9; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e0e0e0;">
              <h2 style="color: #0d6b7a;">Hello, ${parentName}!</h2>
              <p style="color: #666; font-size: 14px;">
                Your child <strong>${studentName}</strong> has been registered at XenEdu
                (Admission: <strong>${admissionNumber}</strong>).
              </p>
              <div style="background: white; border-radius: 12px; padding: 24px; border: 2px solid #E8F5F0; margin-bottom: 20px;">
                <table style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0; color: #888; font-size: 14px; width: 100px;">Email</td>
                    <td style="padding: 8px 0; font-weight: 600; color: #2D2D2D; font-size: 14px;">${parentEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888; font-size: 14px;">Password</td>
                    <td style="padding: 8px 0;">
                      <span style="background: #0d6b7a; color: white; padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 16px;">
                        ${parentPassword}
                      </span>
                    </td>
                  </tr>
                </table>
              </div>
              <div style="margin-top: 24px; text-align: center; color: #aaa; font-size: 12px;">
                XenEdu Mirigama | xenedu@gmail.com | 033-2242-2589
              </div>
            </div>
          </div>
        `,
      });
      console.log('Credentials email sent to parent:', parentEmail);
    } catch (err) {
      console.error('Failed to send parent email:', err.message);
    }
  }
};

const sendAttendanceAlert = async ({ parentName, parentEmail, studentName, className, percentage }) => {
  const resend = getResend();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: parentEmail,
      subject: `Attendance Alert - ${studentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
          <div style="background: #0d6b7a; padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #F5C518; margin: 0; font-size: 32px;">XenEdu</h1>
          </div>
          <div style="background: #f9f9f9; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e0e0e0;">
            <h2 style="color: #DC2626;">Attendance Alert</h2>
            <p style="color: #666; font-size: 14px;">
              Dear ${parentName}, your child <strong>${studentName}</strong>'s
              attendance in <strong>${className}</strong> has dropped below 80%.
            </p>
            <div style="background: #FEF2F2; border: 2px solid #FECACA; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 32px; font-weight: 800; color: #DC2626;">${percentage}%</p>
              <p style="margin: 6px 0 0; font-size: 13px; color: #888;">Current attendance (minimum 80% required)</p>
            </div>
            <div style="margin-top: 24px; text-align: center; color: #aaa; font-size: 12px;">
              XenEdu Mirigama | xenedu@gmail.com | 033-2242-2589
            </div>
          </div>
        </div>
      `,
    });
    console.log('Attendance alert sent to:', parentEmail);
  } catch (err) {
    console.error('Failed to send attendance alert:', err.message);
  }
};

const sendPasswordResetEmail = async ({ name, email, resetUrl }) => {
  const resend = getResend();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'XenEdu - Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
          <div style="background: #0d6b7a; padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #F5C518; margin: 0; font-size: 32px;">XenEdu</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;">A/L Tuition Management System</p>
          </div>
          <div style="background: #f9f9f9; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e0e0e0;">
            <h2 style="color: #1a1a1a;">Reset Your Password</h2>
            <p style="color: #666; font-size: 14px;">Hi <strong>${name}</strong>! Click below to reset your password.</p>
            <a href="${resetUrl}"
              style="display: block; background: #0d6b7a; color: white; padding: 16px 32px;
              border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px;
              text-align: center; margin: 20px 0;">
              Reset My Password
            </a>
            <p style="color: #856404; font-size: 13px; background: #FFF9E6; padding: 12px; border-radius: 8px;">
              This link expires in 1 hour. If you did not request this, ignore this email.
            </p>
            <div style="margin-top: 24px; text-align: center; color: #aaa; font-size: 12px;">
              XenEdu Mirigama | xenedu@gmail.com | 033-2242-2589
            </div>
          </div>
        </div>
      `,
    });
    console.log('Password reset email sent to:', email);
  } catch (err) {
    console.error('Failed to send reset email:', err.message);
    console.error('Error details:', err);
  }
};

module.exports = { sendCredentials, sendAttendanceAlert, sendPasswordResetEmail };
