import keytar from 'keytar';

import nodemailer from 'nodemailer';
import fs from 'fs';
import { html } from 'framer-motion/client';

const SERVICE = 'inexperiencedExpert-mail';
const EMAIL_KEY = 'email';
const PASSWORD_KEY = 'password';

var refEmail;

// Create transporter
async function createTransporter() {
    const email = await keytar.getPassword(SERVICE, EMAIL_KEY);
    const password = await keytar.getPassword(SERVICE, PASSWORD_KEY);

    if (!email || !password) {
        throw new Error('SMTP credentials not found in keytar');
    }

    refEmail = email;

    return nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true,
        auth: {
            user: email,
            pass: password
        }
    });
}

// Function to load the last email sent date from a file
const loadLastEmailSentDate = () => {
    try {
        const data = fs.readFileSync('lastEmailSentDate.json', 'utf-8');
        return JSON.parse(data).date;
    } catch (error) {
        console.log('No previous email dates found, will send email now.');
        return null;
    }
}

// function to save the last email sent date to a file
const saveLastEmailSentDate = (date) => {
    fs.writeFileSync('lastEmailSentDate.json', JSON.stringify({ date }));
}

// Function to compare two dates
const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
};

// Init last email sent date from the file
let lastEmailSentDate = loadLastEmailSentDate();

const sendSpoilageEmail = async ({ expiredItems = [], expiringSoon = [], emails = [], numDays = 0 }) => {
    const today = new Date();

    try {
        if (!lastEmailSentDate || !isSameDay(new Date(lastEmailSentDate), today)) {
            const transporter = await createTransporter();

            const itemTableHTML = (items) => items.map(item => `
                <tr>
                    <td>${item.item_name}</td>
                    <td>${new Date(item.expiration_date).toLocaleDateString()}</td>
                </tr>
            `).join('');

            const expiredHTML = expiredItems.length > 0 ? `
                <h2>Remove Immediately</h2>
                <table border="1" style="border-collapse: collapse;">
                    <tr>
                        <th>Item Name</th>
                        <th>Expiration Date</th>
                    </tr>
                    ${itemTableHTML(expiredItems)}
                </table>
            ` : '';

            const expiringSoonHTML = expiringSoon.length > 0 ? `
                <h2>Items expiring in the next ${numDays} days!</h2>
                <table border="1" style="border-collapse: collapse;">
                    <tr>
                        <th>Item Name</th>
                        <th>Expiration Date</th>
                    </tr>
                    ${itemTableHTML(expiringSoon)}
                </table>
            ` : '';

            const htmlContent = `${expiredHTML}${expiredHTML && expiringSoonHTML ? '<hr>' : ''}${expiringSoonHTML}`;

            if (!htmlContent.trim()) {
                console.log('No expired or expiring items to email about.');
                return false;
            }

            const mailOptions = {
                from: refEmail,
                to: emails,
                subject: `Spoilage Alert!`,
                html: htmlContent
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.response);

            saveLastEmailSentDate(today.toISOString());
            return true;
        } else {
            console.log('Email already sent today.');
            return false;
        }
    } catch (error) {
        console.error('Error sending spoilage email:', error);
        return false;
    }
}
// // function to send Notification email based on set frequency email
// export const sendNotificationEmail = async (expiredItems, numDays, expiringSoon, emails) => {
//     const today = new Date();

//     try {
//         // Create HTML table of expired items
//         const itemTable = expiredItems.length > 0
//             ? expiredItems.map(item => `
//             <tr>
//                 <td>${item.item_name}</td>
//                 <td>${new Date(item.expiration_date).toLocaleDateString()}</td>
//             </tr>
//         `).join('') : '';

//         // Create HTML table of expiring items
//         const ExpiringItemsTable = expiringSoon
//             ? expiringSoon.map(item => `
//             <tr>
//                 <td>${item.item_name}</td>
//                 <td>${new Date(item.expiration_date).toLocaleDateString()}</td>
//             </tr>
//         `).join('') : '';

// const htmlContent = `${expiredHTML}${expiredHTML && expiringSoonHTML ? '<hr>' : ''}${expiringSoonHTML}`;

// if (!htmlContent.trim()) {
//     console.log('No expired or expiring items to email about.');
//     return false;
// }



//         if (!lastEmailSentDate || !isSameDay(new Date(lastEmailSentDate), today)) {
//             const transporter = await createTransporter();

//             const mailOptions = {
//                 from: refEmail,
//                 to: emails,
//                 subject: `Spoilage Alert!`,
//                 html: `
//                     ${expiredItems.length > 0 ?
//                         `<h2>Remove Immediately</h2>
//                         <table border="1" style="border-collapse: collapse;">
//                             <tr>
//                                 <th>Item Name</th>
//                                 <th>Expiration Date</th>
//                             </tr>
//                             ${itemTable}
//                         </table>`
//                         : ''
//                     }

//                     ${expiredItems.length > 0 ? `
//                         <hr class="solid"></hr>
//                     ` : ''}

//                     ${expiringSoon.length > 0 ?
//                         `<h2>Items expiring in the next ${numDays} days!</h2>
//                         <table border="1" style="border-collapse: collapse;">
//                             <tr>
//                                 <th>Item Name</th>
//                                 <th>Expiration Date</th>
//                             </tr>
//                             ${ExpiringItemsTable}
//                         </table>`
//                         : ''}
//                 `
//             }

//             const info = await transporter.sendMail(mailOptions);
//             console.log(`Email sent for items expiring in ${numDays}:`, info.response);

//             // update the last email sent date to today
//             saveLastEmailSentDate(today.toISOString());
//             return true;
//         } else {
//             console.log('Email has already been sent today. No more emails today!');
//             return false;
//         }
//     } catch (error) {
//         console.error('Error sending email for items expiring soon: ', error);
//         return false;
//     }
// }

export const sendExpirationEmail = async (expiredItems, emails) => {
    return sendSpoilageEmail({ expiredItems, emails });
};

export const sendNotificationEmail = async (expiredItems, numDays, expiringSoon, emails) => {
    return sendSpoilageEmail({ expiredItems, expiringSoon, emails, numDays });
};