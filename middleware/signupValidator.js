import { body } from 'express-validator';

const signupValidator = [
    body('username')
        .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters.')
        .notEmpty().withMessage('Username is required.'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
        .notEmpty().withMessage('Password is required.'),
    body('email')
        .isEmail().withMessage('Invalid email format.')
        .notEmpty().withMessage('Email is required.'),
    body('captchaToken')
        .notEmpty().withMessage('reCAPTCHA token is required.')
];

export default signupValidator;
