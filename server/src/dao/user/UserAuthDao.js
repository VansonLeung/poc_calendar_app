import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const UserAuthDao = {
    registerUser: async ({ models, user }) => {
        const { User, UserCredential, UserSession } = models;
        const { username, email, password } = user;

        try {
            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [
                        { username: username },
                        { email: email },
                    ]
                }
            });

            if (existingUser) {
                throw new Error("User with this username or email already exists");
            }

            // Hash the password before saving
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await User.create({ username, email });
            await UserCredential.create({ userId: newUser.id, password: hashedPassword });

            const session = await UserSession.create({ 
                userId: user.id,
                accessToken: crypto.randomBytes(32).toString('hex'),
                refreshToken: crypto.randomBytes(32).toString('hex'),
            });

            return {
                user: newUser,
                session,
            };
        } catch (error) {
            throw error;
        }
    },

    loginUser: async ({ models, username, password }) => {
        const { User, UserCredential, UserSession } = models;

        try {
            if (!username || !password) {
                throw new Error("Username and password are required");
            }

            const user = await User.findOne({
                where: {
                    [Op.or]: [
                        { username: username },
                        { email: username },
                    ]
                }
            });

            if (!user) {
                throw new Error("User not found");
            }

            const credential = await UserCredential.findOne({ where: { userId: user.id } });

            // Compare the hashed password
            const isMatch = await bcrypt.compare(password, credential.password);
            if (!credential || !isMatch) {
                throw new Error("Invalid credentials");
            }

            const session = await UserSession.create({ 
                userId: user.id,
                accessToken: crypto.randomBytes(32).toString('hex'),
                refreshToken: crypto.randomBytes(32).toString('hex'),
            });

            return {
                user,
                session,
            }
        } catch (error) {
            throw error;
        }
    },

    logoutUser: async ({ models, sessionId }) => {
        const { UserSession } = models;

        try {
            const session = await UserSession.findByPk(sessionId);
            if (!session) {
                throw new Error("Session not found");
            }
            await session.destroy();
            return { message: "Logged out successfully" };
        } catch (error) {
            throw new Error("Error logging out: " + error.message);
        }
    },

    accessSession: async ({ models, accessToken }) => {
        const { UserSession } = models;

        try {
            const session = await UserSession.findOne({ 
                where: { accessToken },
                include: [{ model: models.User, as: 'user' }],
            });
            if (!session) {
                throw new Error("Session not found or expired");
            }
            return { 
                session, 
                user: session.user, 
                userRole: await session.user.getUserRole(), 
            };
        } catch (error) {
            throw new Error("Error verifying session: " + error.message);
        }
    },

    refreshSession: async ({ models, refreshToken }) => {
        const { UserSession } = models;

        try {
            const session = await UserSession.findOne({ where: { refreshToken } });
            if (!session) {
                throw new Error("Session not found or expired");
            }
            // Generate new tokens
            const newAccessToken = crypto.randomBytes(32).toString('hex');
            const newRefreshToken = crypto.randomBytes(32).toString('hex');
            session.accessToken = newAccessToken;
            session.refreshToken = newRefreshToken;
            await session.save();
            return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        } catch (error) {
            throw new Error("Error refreshing session: " + error.message);
        }
    },
};