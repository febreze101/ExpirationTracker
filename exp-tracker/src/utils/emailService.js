import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import fs from 'fs';

dotenv.config();
console.log('Environment variables loaded:', {
    EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set'
});

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_RECIPIENT) {
    throw new Error('Email credentials are not set.');
}

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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

// function to send email
export const sendEmail = async (expiredItems, numDays, expiringSoon) => {
    const today = new Date();

    try {
        // Create HTML table of expired items
        const itemTable = expiredItems.length > 0
            ? expiredItems.map(item => `
            <tr>
                <td>${item.item_name}</td>
                <td>${new Date(item.expiration_date).toLocaleDateString()}</td>
            </tr>
        `).join('') : '';

        // Create HTML table of expiring items
        const ExpiringItemsTable = expiringSoon
            ? expiringSoon.map(item => `
            <tr>
                <td>${item.item_name}</td>
                <td>${new Date(item.expiration_date).toLocaleDateString()}</td>
            </tr>
        `).join('') : '';

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_RECIPIENT,
            subject: `Spoilage Alert!`,
            html: `
                ${expiredItems.length > 0 ?
                    `<h2>Remove Immediately</h2>
                    <table border="1" style="border-collapse: collapse;">
                        <tr>
                            <th>Item Name</th>
                            <th>Expiration Date</th>
                        </tr>
                        ${itemTable}
                    </table>`
                    : ''
                }

                ${expiredItems.length > 0 ? `
                    <hr class="solid"></hr>
                ` : ''}
                
                ${expiringSoon.length > 0 ?
                    `<h2>Items expiring in the next ${numDays} days!</h2>
                    <table border="1" style="border-collapse: collapse;">
                        <tr>
                            <th>Item Name</th>
                            <th>Expiration Date</th>
                        </tr>
                        ${ExpiringItemsTable}
                    </table>`
                    : ''}
            `
        }

        if (!lastEmailSentDate || !isSameDay(new Date(lastEmailSentDate), today)) {
            const info = await transporter.sendMail(mailOptions);
            console.log(`Email sent for items expiring in ${numDays}:`, info.response);

            // update the last email sent date to today
            saveLastEmailSentDate(today.toISOString());
            return true;
        } else {
            console.log('Email has already been sent today. No more emails today!');
            return false;
        }
    } catch (error) {
        console.error('Error sending email for items expiring soon: ', error);
        return false;
    }
}