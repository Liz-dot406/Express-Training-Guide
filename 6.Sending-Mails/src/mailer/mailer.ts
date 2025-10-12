import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (
    to: string,
    subject: string,
    html?: string
): Promise<string> => {
    try {
        const transporter = nodemailer.createTransport({//transport is used to send emails 
            host: process.env.SMTP_HOST,  // Gmail SMTP server - smtp in full is simple mail transfer protocol
            port: 465,  // SMTP port for Gmail -  is used to send emails
            service: 'gmail',  // Gmail service
            secure: true, // Use SSL for secure connection  - ssl in full is secure socket layer
            auth: { // Authentication details for the email account
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });

        const mailOptions: nodemailer.SendMailOptions = { // Mail options for the email to be sent
            from: process.env.MAIL_USER,
            to,
            subject,
            html
        };

        const mailRes = await transporter.sendMail(mailOptions); // Send the email using the transporter and mail options
        console.log("Message sent:", mailRes);

        if (mailRes.accepted.length > 0) return 'Email sent successfully';
        if (mailRes.rejected.length > 0) return 'Email not sent';
        return 'Email server not responding';
    } catch (error: any) {
        console.log("Error sending email:", error.message);
        return JSON.stringify(error.message);
    }
};