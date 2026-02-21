// controllers/contactController.js
const Contact       = require('../models/Contact');
const { sendEmail } = require('../config/mailer');

/* ─── SUBMIT CONTACT FORM ─── */
exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, service, message } = req.body;

    /* 1. Persist to MongoDB */
    const doc = await Contact.create({ name, email, phone, service, message });

    /* 2. Notify admin */
    await sendEmail({
      to: process.env.EMAIL_TO,
      subject: `[WeCanMakeIt] New Enquiry: ${service} — ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:580px;margin:auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#027373,#038C7F);padding:2rem;text-align:center;">
            <h1 style="color:#F2E7DC;margin:0;font-size:1.6rem;letter-spacing:-0.03em;">WeCanMakeIt</h1>
            <p style="color:#A9D9D0;margin:0.4rem 0 0;font-size:0.85rem;">New Contact Form Submission</p>
          </div>
          <div style="padding:2rem;">
            <table style="width:100%;border-collapse:collapse;">
              ${[['Name',name],['Email',email],['Phone',phone||'—'],['Service',service]].map(([k,v])=>`
              <tr>
                <td style="padding:0.6rem 0;font-weight:700;color:#555;font-size:0.85rem;width:100px;vertical-align:top;">${k}</td>
                <td style="padding:0.6rem 0;color:#111;font-size:0.9rem;">${v}</td>
              </tr>`).join('')}
            </table>
            <div style="background:#f8f8f8;border-radius:8px;padding:1.2rem;margin-top:1rem;">
              <p style="font-weight:700;color:#555;font-size:0.85rem;margin-bottom:0.5rem;">Message</p>
              <p style="color:#111;font-size:0.9rem;line-height:1.6;margin:0;">${message}</p>
            </div>
          </div>
        </div>`,
    });

    /* 3. Auto-reply to client */
    await sendEmail({
      to: email,
      subject: `We received your message — WeCanMakeIt`,
      html: `
        <div style="font-family:sans-serif;max-width:580px;margin:auto;">
          <div style="background:linear-gradient(135deg,#027373,#038C7F);padding:2rem;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="color:#F2E7DC;margin:0;font-size:1.6rem;">WeCanMakeIt</h1>
          </div>
          <div style="padding:2rem;background:#fff;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
            <h2 style="color:#027373;font-size:1.2rem;">Thank you, ${name}!</h2>
            <p style="color:#444;line-height:1.7;">We've received your enquiry about <strong>${service}</strong> and our team will reach out within <strong>24 hours</strong> with a personalised plan and quote.</p>
            <p style="color:#038C7F;font-weight:700;margin-top:1.5rem;">— The WeCanMakeIt Team</p>
            <p style="color:#999;font-size:0.8rem;">📧 hello@wecanmakeit.in | 📞 +91 98765 43210</p>
          </div>
        </div>`,
    });

    res.status(201).json({ success:true, message:'Message sent successfully!', id:doc._id });
  } catch (err) { next(err); }
};

/* ─── LIST ALL (admin) ─── */
exports.listContacts = async (req, res, next) => {
  try {
    const { page=1, limit=20, status } = req.query;
    const filter = status ? { status } : {};
    const [data, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt:-1 }).skip((page-1)*limit).limit(+limit),
      Contact.countDocuments(filter),
    ]);
    res.json({ success:true, total, page:+page, pages:Math.ceil(total/limit), data });
  } catch (err) { next(err); }
};

/* ─── UPDATE STATUS (admin) ─── */
exports.updateStatus = async (req, res, next) => {
  try {
    const doc = await Contact.findByIdAndUpdate(req.params.id, { status:req.body.status }, { new:true, runValidators:true });
    if (!doc) return res.status(404).json({ success:false, error:'Contact not found.' });
    res.json({ success:true, data:doc });
  } catch (err) { next(err); }
};
