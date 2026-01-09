import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// Chỉ khởi tạo Google Strategy nếu có GOOGLE_CLIENT_ID
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.BACKEND_URL || 'http://localhost:8080'}/auth/google/callback`
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Lấy thông tin từ Google profile
                    const { id, emails, displayName, photos } = profile;
                    const email = emails && emails[0] ? emails[0].value : null;
                    const picture = photos && photos[0] ? photos[0].value : null;

                    // Trả về user object để xử lý trong callback
                    return done(null, {
                        id,
                        email,
                        name: displayName,
                        picture
                    });
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
    console.log('✅ Google OAuth Strategy initialized');
} else {
    console.log('⚠️  Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable Google login.');
}

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

export default passport;
