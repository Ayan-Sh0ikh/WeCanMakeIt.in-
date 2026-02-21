// routes/payment.js
const express = require('express');
const { body } = require('express-validator');
const router  = express.Router();
const ctrl    = require('../controllers/paymentController');
const auth    = require('../middleware/auth');
const admin   = require('../middleware/admin');
const validate= require('../middleware/validate');

const payBody = [
  body('plan').notEmpty().withMessage('Plan is required'),
  body('amount').isFloat({gt:0}).withMessage('Amount must be positive'),
  body('customerEmail').isEmail().normalizeEmail().withMessage('Valid email required'),
];

/* Stripe */
router.post('/stripe/create-intent', payBody, validate, ctrl.stripeCreateIntent);
router.post('/stripe/webhook',       ctrl.stripeWebhook);   // raw body — set in server.js

/* Razorpay */
router.post('/razorpay/create-order', payBody, validate, ctrl.razorpayCreateOrder);
router.post('/razorpay/verify',
  [
    body('razorpay_order_id').notEmpty(),
    body('razorpay_payment_id').notEmpty(),
    body('razorpay_signature').notEmpty(),
  ],
  validate,
  ctrl.razorpayVerify
);

/* Admin */
router.get('/', auth, admin, ctrl.listPayments);

module.exports = router;
