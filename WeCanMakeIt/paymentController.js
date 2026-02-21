// controllers/paymentController.js
const stripe   = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Payment  = require('../models/Payment');
const { sendEmail } = require('../config/mailer');

const rzp = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ═══════════ STRIPE ═══════════ */

exports.stripeCreateIntent = async (req, res, next) => {
  try {
    const { plan, amount, currency = 'inr', customerEmail, customerName } = req.body;

    const intent = await stripe.paymentIntents.create({
      amount:   Math.round(amount * 100), // paise
      currency,
      receipt_email: customerEmail,
      metadata: { plan, customerEmail, customerName, source:'wecanmakeit' },
      automatic_payment_methods: { enabled: true },
    });

    await Payment.create({
      gateway: 'stripe', gatewayId: intent.id,
      plan, amount, currency: currency.toUpperCase(),
      customerEmail, customerName, status:'pending',
    });

    res.json({ success:true, clientSecret: intent.client_secret, intentId: intent.id });
  } catch (err) { next(err); }
};

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  try {
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      const payment = await Payment.findOneAndUpdate(
        { gatewayId: pi.id },
        { status:'success', paidAt: new Date() },
        { new:true }
      );
      if (payment?.customerEmail) {
        await sendEmail({
          to: payment.customerEmail,
          subject: 'Payment Successful — WeCanMakeIt',
          html: `<p>Hi ${payment.customerName || ''},<br/>Your payment of <strong>₹${payment.amount.toLocaleString()}</strong> for the <strong>${payment.plan}</strong> plan has been received. We'll be in touch within 24 hours.</p>`,
        });
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      await Payment.findOneAndUpdate({ gatewayId: event.data.object.id }, { status:'failed' });
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: 'Webhook handler failed.' });
  }
};

/* ═══════════ RAZORPAY ═══════════ */

exports.razorpayCreateOrder = async (req, res, next) => {
  try {
    const { plan, amount, currency = 'INR', customerEmail, customerName } = req.body;
    const receipt = `wcmi_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

    const order = await rzp.orders.create({
      amount:   Math.round(amount * 100),
      currency: currency.toUpperCase(),
      receipt,
      notes: { plan, customerEmail, customerName },
    });

    await Payment.create({
      gateway:'razorpay', gatewayId: order.id,
      plan, amount, currency: currency.toUpperCase(),
      customerEmail, customerName, status:'pending',
      meta: { receipt },
    });

    res.json({
      success: true,
      orderId: order.id,
      amount:  order.amount,
      currency:order.currency,
      keyId:   process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) { next(err); }
};

exports.razorpayVerify = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      await Payment.findOneAndUpdate({ gatewayId: razorpay_order_id }, { status:'failed' });
      return res.status(400).json({ success:false, error:'Payment signature mismatch.' });
    }

    const payment = await Payment.findOneAndUpdate(
      { gatewayId: razorpay_order_id },
      { status:'success', paidAt:new Date(), gatewayPaymentId: razorpay_payment_id },
      { new:true }
    );

    if (payment?.customerEmail) {
      await sendEmail({
        to: payment.customerEmail,
        subject: 'Payment Confirmed — WeCanMakeIt',
        html: `<p>Payment of ₹${payment.amount.toLocaleString()} for <strong>${payment.plan}</strong> confirmed via Razorpay. We'll contact you within 24 hours.</p>`,
      });
    }

    res.json({ success:true, message:'Payment verified successfully.', paymentId: razorpay_payment_id });
  } catch (err) { next(err); }
};

/* ─── LIST PAYMENTS (admin) ─── */
exports.listPayments = async (req, res, next) => {
  try {
    const { page=1, limit=20, status, gateway } = req.query;
    const filter = {};
    if (status)  filter.status  = status;
    if (gateway) filter.gateway = gateway;
    const [data, total] = await Promise.all([
      Payment.find(filter).sort({ createdAt:-1 }).skip((page-1)*limit).limit(+limit),
      Payment.countDocuments(filter),
    ]);
    const revenue = await Payment.aggregate([
      { $match:{ status:'success' } },
      { $group:{ _id:null, total:{ $sum:'$amount' } } },
    ]);
    res.json({ success:true, total, revenue: revenue[0]?.total||0, page:+page, data });
  } catch (err) { next(err); }
};
