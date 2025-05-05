import keytar from 'keytar';

const SERVICE = 'inexperiencedExpert-mail';
const EMAIL_KEY = 'email';
const PASSWORD_KEY = 'password';

export async function getCredentials() {
    const email = await keytar.getPassword(SERVICE, EMAIL_KEY);
    const password = await keytar.getPassword(SERVICE, PASSWORD_KEY);

    if (!email || !password) {
        throw new Error('Credentials not set in keytar');
    }

    return { email, password };
}
