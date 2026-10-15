import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendMail = async (options) => {
    const mailgenerator = new Mailgen({
        theme: "default",
        product: {
            name: "MiniShop",
            link: "https://minishop.com/",
        },
    });
    const emailTexual = mailgenerator.generatePlaintext(options.mailgenContent);
    const emailHTML = mailgenerator.generate(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASSWORD,
        },
    });

    const mail = {
        from: "minishop.admin@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTexual,
        html: emailHTML,
    };

    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

const emailVerificationMailGenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to MiniShop! We're very excited to have you on board.",
            action: {
                instructions:
                    "To get started with your account, please click here:",
                button: {
                    color: "#22BC66",
                    text: "Verify your email",
                    link: verificationUrl,
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };
};

const forgotPasswordMailGenContent = (username, resetPasswordUrl) => {
    return {
        body: {
            name: username,
            intro: "You have requested to reset your password.",
            action: {
                instructions: "To reset your password, please click here:",
                button: {
                    color: "#FF0000",
                    text: "Reset your password",
                    link: resetPasswordUrl,
                },
            },
            outro: "If you did not request a password reset, please ignore this email.",
        },
    };
};

export {
    emailVerificationMailGenContent,
    forgotPasswordMailGenContent,
    sendMail,
};
