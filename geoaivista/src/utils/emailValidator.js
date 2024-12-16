import * as deepe from 'deep-email-validator';

export async function validateEmail(email) {
    return await deepe.validate(email);
}