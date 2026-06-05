import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
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
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
       
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = String(profile.emails?.[0]?.value || '').trim().toLowerCase();
          if (!email) return done(new Error('Google account email is required'));
          const profilePicture = profile.photos?.[0]?.value || '';
          log.info(`[Auth][Google] Profile received googleId=${profile.id} email=${email}`);
          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });
          let isNewUser = false;
          log.info(`[Auth][Google] User lookup result found=${Boolean(user)} userId=${user?._id || 'none'} db=${User.db.name} collection=${User.collection.name}`);

          if (!user) {
            isNewUser = true;
            user = await User.create({
              googleId: profile.id,
              email,
              name: profile.displayName || email.split('@')[0],
              profilePicture,
              isActive: true,
            });
            log.info(`[Auth][Google] User creation result success email=${email} userId=${user._id}`);
            const emailResult = await sendWelcomeEmailSafe(user);
            if (emailResult?.sent) {
              user.welcomeEmailSentAt = new Date();
              await user.save({ validateBeforeSave: false });
            }
          } else {
            if (!user.googleId) user.googleId = profile.id;
            if (profilePicture && !user.profilePicture) user.profilePicture = profilePicture;
            user.isActive = true;
            await user.save();
            log.info(`[Auth][Google] Existing user updated email=${email} userId=${user._id}`);
          }

          done(null, { ...user.toObject(), isAdmin: false, token: generateToken(user), isNewUser });
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

export default passport;
