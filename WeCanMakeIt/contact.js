// routes/contact.js
const express = require('express');
const { body } = require('express-validator');
const router  = express.Router();
const ctrl    = require('../controllers/contactController');
const auth    = require('../middleware/auth');
const admin   = require('../middleware/admin');
const validate= require('../middleware/validate');

router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('service').notEmpty().withMessage('Service is required'),
    body('message').trim().isLength({min:10}).withMessage('Message must be at least 10 characters'),
  ],
  validate,
  (req, res, next) => { req.body.ip = req.ip; next(); },
  ctrl.submitContact
);

router.get('/',     auth, admin, ctrl.listContacts);
router.patch('/:id',auth, admin, [body('status').isIn(['new','read','replied','closed'])], validate, ctrl.updateStatus);

module.exports = router;
