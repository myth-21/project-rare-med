import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { createToken } from '../services/authService.js';
import { sendWelcomeEmailSafe } from '../services/emailService.js';
import log from '../utils/logger.js';

const apiPublicUrl = () =>
  (process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');

const googleCallbackUrl = () =>
  process.env.GOOGLE_CALLBACK_URL || `${apiPublicUrl()}/api/auth/google/callback`;

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  log.info(`[Auth][Google] Strategy configured callbackUrl=${googleCallbackUrl()}`);
 passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: googleCallbackUrl(),
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = String(
          profile.emails?.[0]?.value || ''
        )
          .trim()
          .toLowerCase();

        if (!email) {
          return done(new Error('Google account email is required'));
        }

        const profilePicture =
          profile.photos?.[0]?.value || '';

        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email }
          ]
        });

        let isNewUser = false;

        if (!user) {
          isNewUser = true;

          user = await User.create({
            googleId: profile.id,
            email,
            name:
              profile.displayName ||
              email.split('@')[0],
            profilePicture,
            isActive: true,
          });

          await sendWelcomeEmailSafe(user);
        } else {
          if (!user.googleId)
            user.googleId = profile.id;

          if (
            profilePicture &&
            !user.profilePicture
          ) {
            user.profilePicture = profilePicture;
          }

          user.isActive = true;

          await user.save();
        }

        return done(null, {
          ...user.toObject(),
          isAdmin: false,
          token: createToken(user._id),
          isNewUser,
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);
}

export default passport;
