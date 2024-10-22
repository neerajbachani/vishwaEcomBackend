
// const nodemailer = require("nodemailer")
// const Mailgen = require("mailgen")

// const ENV = require('../config/mail')


// // https://ethereal.email/create
// let nodeConfig = {
//     host: "smtp.ethereal.email",
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//         user: ENV.EMAIL, // generated ethereal user
//         pass: ENV.PASSWORD, // generated ethereal password
//     }
// }

// let transporter = nodemailer.createTransport(nodeConfig);

// let MailGenerator = new Mailgen({
//     theme: "default",
//     product: {
//       name: "Resin Gift Store",
//       link: 'https://resingiftstore.com/'
//     }
//   });

// /** POST: http://localhost:8080/api/registerMail 
//  * @param: {
//   "username" : "example123",
//   "userEmail" : "admin123",
//   "text" : "",
//   "subject" : "",
// }
// */
// const registerMail = async (req, res) => {
//     const { username, userEmail, text, subject } = req.body;

//     let config = {
//         service : 'gmail',
//         auth : {
//             user: ENV.EMAIL,
//             pass: ENV.PASSWORD
//         }
//     }
//     let transporter = nodemailer.createTransport(config);
//     // body of the email
//     var email = {
//         body : {
//             name: username,
//             intro : text || 'Welcome to the Resin Gift Store.',
//             outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
//         }
//     }

//     var emailBody = MailGenerator.generate(email);

//     let message = {
//         from : ENV.EMAIL,
//         to: userEmail,
//         subject : subject || "Signup Successful",
//         html : emailBody
//     }

//     // send mail
//     transporter.sendMail(message)
//         .then(() => {
//             return res.status(200).send({ msg: "You should receive an email from us."})
//         })
//         .catch(error => res.status(500).send({ error }))

// }

// const sendMail = async ({ to, subject, text }) => {
//     try {
//       let email = {
//         body: {
//           intro: text,
//           outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
//         }
//       };
  
//       let emailBody = MailGenerator.generate(email);
  
//       let message = {
//         from: ENV.EMAIL,
//         to: to,
//         subject: subject,
//         html: emailBody
//       };
  
//       await transporter.sendMail(message);
//       console.log(`Email sent to ${to}`);
//     } catch (error) {
//       console.error('Error sending email:', error);
//       throw new Error('Failed to send email');
//     }
//   };
  

// module.exports = {registerMail, sendMail}
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const ENV = require('../config/mail');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: ENV.EMAIL,
        pass: ENV.PASSWORD
    }
});

let MailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: "Resin Gift Store",
        link: 'https://resingiftstore.com/'
    }
});

const sendMail = async ({ to, subject, text }) => {
    if (!to) {
        throw new Error('Recipient email is required');
    }

    try {
        let email = {
            body: {
                intro: text,
                outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
            }
        };

        let emailBody = MailGenerator.generate(email);

        let message = {
            from: ENV.EMAIL,
            to: to,
            subject: subject,
            html: emailBody
        };

        await transporter.sendMail(message);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

const registerMail = async (req, res) => {
    const { username, userEmail, text, subject } = req.body;

    try {
        await sendMail({
            to: userEmail,
            subject: subject || "Signup Successful",
            text: text || `Welcome to the Resin Gift Store, ${username}.`
        });
        res.status(200).send({ msg: "You should receive an email from us." });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

module.exports = { registerMail, sendMail };