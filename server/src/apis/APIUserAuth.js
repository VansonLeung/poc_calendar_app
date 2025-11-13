import { UserAuthDao } from "../dao/user/UserAuthDao.js";
import { _APIGenericMiddlewaresACL } from "./_incl/index.js";

export const APIUserAuth = {
    initialize: ({ app, appWithMeta, models }) => {

        appWithMeta.post(`/api/auth/login`, {
            summary: "User login",
            description: "Authenticate user with username/email and password",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["username", "password"],
                            properties: {
                                username: {
                                    type: "string",
                                    description: "Username or email address"
                                },
                                password: {
                                    type: "string",
                                    description: "User password"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Login successful",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    user: {
                                        $ref: "#/components/schemas/User"
                                    },
                                    session: {
                                        $ref: "#/components/schemas/UserSession"
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: "Invalid credentials"
                }
            }
        }, async (req, res) => {
            try {
                const { username, password } = req.body;
                const { user, session, } = await UserAuthDao.loginUser({ models, username, password, });
                res.sendResponse({status: 200, data: { user, session } });
            } catch (error) {
                res.sendError({error, });
                throw error;
            }
        });
        
        appWithMeta.post(`/api/auth/logout`, {
            summary: "User logout",
            description: "Logout the current user session",
            responses: {
                200: {
                    description: "Logout successful",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    message: {
                                        type: "string",
                                        example: "Logged out successfully"
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: "Unauthorized - invalid session"
                }
            }
        }, 

            _APIGenericMiddlewaresACL.applyMiddlewareACL({ 
                models, 
                apiName: `auth`, 
                requiredPermission: `logout`, 
            }), 

            async (req, res) => {
                try {
                    const result = await UserAuthDao.logoutUser({ models, sessionId: req.session.id, })
                    res.sendResponse({status: 200, data: result });
                } catch (error) {
                    res.sendError({error, });
                    throw error;
                }
            },
        );
        
        appWithMeta.post(`/api/auth/register`, {
            summary: "User registration",
            description: "Register a new user account",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["username", "email", "password"],
                            properties: {
                                username: {
                                    type: "string",
                                    description: "Unique username for the user"
                                },
                                email: {
                                    type: "string",
                                    format: "email",
                                    description: "Email address for the user"
                                },
                                password: {
                                    type: "string",
                                    description: "Password for the user account"
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: "Registration successful",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    user: {
                                        $ref: "#/components/schemas/User"
                                    },
                                    session: {
                                        $ref: "#/components/schemas/UserSession"
                                    }
                                }
                            }
                        }
                    }
                },
                409: {
                    description: "User already exists"
                }
            }
        }, async (req, res) => {
            try {
                const user = req.body;
                const { user: newUser, session, } = await UserAuthDao.registerUser({ models, user, });
                res.sendResponse({status: 200, data: { user: newUser, session, } });
            } catch (error) {
                res.sendError({error, });
                throw error;
            }
        });
    }
}