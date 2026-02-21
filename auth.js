// routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const router  = express.Router();
const ctrl    = require('../controllers/authController');
const auth    = require('../middleware/auth');
const validate= require('../middleware/validate');

router.post('/register',
  [ body('name').trim().notEmpty().withMessage('Name required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({min:8}).withMessage('Password must be ≥ 8 chars'), ],
  validate, ctrl.register);

router.post('/login',
  [ body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(), ],
  validate, ctrl.login);

router.post('/refresh', ctrl.refreshToken);
router.get('/profile', auth, ctrl.getProfile);

module.exports = router;
