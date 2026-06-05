const {Router} = require('express');
const authController = require('../controllers/authController');
const { requireAuth, checkUser } = require('../middleware/authMiddleware');
const router = Router();

// routes
router.get('/',          authController.welcome_get);
router.get('/dashboard', requireAuth, authController.dashboard_get);
router.get('/signup',    authController.signup_get);
router.post('/signup',   authController.signup_post);
router.get('/signin',    authController.signin_get);
router.post('/signin',   authController.signin_post);
router.get('/signout',   authController.signout_get);

// export
module.exports = router;
