import nodemailer from 'nodemailer';
import User from "@/models/userModel";
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';


export const sendEmail = async ({ email, emailType, userId }: any) => {
    try {
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = await bcryptjs.hash(rawToken, 10);

        if (emailType === "VERIFY") {
            await User.findByIdAndUpdate(userId,
                { verifyToken: hashedToken, verifyTokenExpiry: Date.now() + 3600000 });
        } else if (emailType === "RESET") {
            await User.findByIdAndUpdate(userId,
                { forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry: Date.now() + 3600000 });
        }

        const transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "336e6799376bac",
                pass: "f8320e0ed94e2a"
            }
        });

        const backendDomain =
            process.env.NODE_ENV === "production"
                ? process.env.NEXT_PUBLIC_API_URL
                : process.env.DOMAIN;
        const urlPath = emailType === "VERIFY" ? "verifyemail" : "resetpassword";
        const url = `${backendDomain}/${urlPath}?token=${rawToken}&id=${userId}`;

        const mailOptions = {
            from: 'pratham@gmail.com',
            to: email,
            subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
            html: `<p>Click <a href="${url}">here</a> to ${emailType === "VERIFY" ? "verify your email" : "reset your password"}
            or copy and paste the link below in your browser. <br> ${url}
            </p>`
        }

        const mailresponse = await transport.sendMail(mailOptions);
        return mailresponse;

    } catch (error: any) {
        throw new Error(error.message);
    }
}