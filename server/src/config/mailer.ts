import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PWD,
  },
});

export default transporter;

export async function testEmail() {
  await sendMail(
    "work.frastioagustian@gmail.com",
    "TEST",
    "<h1>TEST ONLY!</h1>"
  );
}

export async function sendMail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.log(err);
  }
}
