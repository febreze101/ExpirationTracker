import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

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

export const sendExpirationEmail = async (expiredItems) => {
    try {
        // Create HTML table of expired items
        const itemTable = expiredItems.map(item => `
            <tr>
                <td>${item.item_name}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td>${new Date(item.expiration_date).toLocaleDateString()}</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_RECIPIENT,
            subject: 'Expired Items Alert',
            html: `
                <h2>Expired Items</h2>
                <table border="1" style="border-collapse: collapse;">
                    <tr>
                        <th>Item Name</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Expiration Date</th>
                    </tr>
                    ${itemTable}
                </table>
            `
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('Expiration email sent: ', info.response);
        return true;
    } catch (error) {
        console.error('Error sending expiration email: ', error);
        return false;
    }

}
