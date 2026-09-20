import jwt from 'jsonwebtoken';
import { User, Workspace } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { HTTP_STATUS, USER_ROLES } from '../constants/index.js';
import { config } from '../config/env.js';

// Secure cookie settings for JWT tokens
const getCookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: config.env === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: maxAgeMs,
});

const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Helper to generate tokens, persist refresh token on user, and set HTTP-only cookies
 */
const issueTokensAndSetCookies = async (user, res) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Token rotation: update stored refresh token
  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  // Set HTTP-Only cookies
  res.cookie('accessToken', accessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));
  res.cookie('refreshToken', refreshToken, getCookieOptions(REFRESH_COOKIE_MAX_AGE));

  return { accessToken, refreshToken };
};

/**
 * @desc Register a new user and bootstrap their default workspace
 * @route POST /api/v1/auth/register
 * @access Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, workspaceName } = req.body;

  // 1. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'An account with this email address already exists');
  }

  // 2. Generate workspace details
  const companyTitle = workspaceName && workspaceName.trim().length > 0
    ? workspaceName.trim()
    : `${name.split(' ')[0]}'s Workspace`;

  const slugBase = companyTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30);
  const uniqueSlug = `${slugBase}-${Math.random().toString(36).substring(2, 7)}`;

  // 3. Create user initially
  const newUser = new User({
    name,
    email,
    password,
    role: USER_ROLES.OWNER,
  });

  // 4. Create default workspace owned by this user
  const newWorkspace = await Workspace.create({
    name: companyTitle,
    slug: uniqueSlug,
    ownerId: newUser._id,
    plan: 'starter',
  });

  // 5. Associate primary workspace with user
  newUser.workspaceId = newWorkspace._id;
  newUser.workspaces = [
    {
      workspace: newWorkspace._id,
      role: USER_ROLES.OWNER,
    },
  ];

  await newUser.save();

  // 6. Issue access and refresh tokens with HTTP-only cookies
  const { accessToken } = await issueTokensAndSetCookies(newUser, res);

  const safeUser = newUser.toJSON();

  return res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, 'Registration successful. Workspace created.', {
      user: safeUser,
      workspace: newWorkspace,
      accessToken,
    })
  );
});

/**
 * @desc Login user, rotate refresh token, and set HTTP-only cookies
 * @route POST /api/v1/auth/login
 * @access Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Find user with password and refreshToken
  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Your account has been deactivated. Please contact support.');
  }

  // 2. Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
  }

  // 3. Rotate tokens and set cookies
  const { accessToken } = await issueTokensAndSetCookies(user, res);

  // 4. Fetch workspace details
  const workspace = user.workspaceId ? await Workspace.findById(user.workspaceId) : null;
  const safeUser = user.toJSON();

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Login successful', {
      user: safeUser,
      workspace,
      accessToken,
    })
  );
});

/**
 * @desc Rotate refresh token and issue fresh access token
 * @route POST /api/v1/auth/refresh-token
 * @access Public (Requires valid Refresh Token in Cookie or Body)
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Refresh token missing. Session expired.');
  }

  try {
    // 1. Verify token signature
    const decoded = jwt.verify(incomingRefreshToken, config.jwt.refreshSecret);

    // 2. Lookup user
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid refresh token: User not found');
    }

    // 3. Token Reuse Detection (Rotation Security)
    if (!user.refreshToken || user.refreshToken !== incomingRefreshToken) {
      // Refresh token reuse or revoked! Invalidate immediately for safety
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });

      const clearOptions = {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'lax',
        path: '/',
      };
      res.clearCookie('accessToken', clearOptions);
      res.clearCookie('refreshToken', clearOptions);

      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        'Invalid session or token reuse detected. Please log in again.'
      );
    }

    // 4. Issue NEW access token AND NEW refresh token (Rotation)
    const { accessToken, refreshToken: newRefreshToken } = await issueTokensAndSetCookies(user, res);

    return res.status(HTTP_STATUS.OK).json(
      new ApiResponse(HTTP_STATUS.OK, 'Session refreshed successfully with token rotation', {
        accessToken,
        refreshTokenRotated: true,
      })
    );
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Refresh token is expired or invalid');
  }
});

/**
 * @desc Logout user, revoke stored refresh token, and clear cookies
 * @route POST /api/v1/auth/logout
 * @access Public / Authenticated
 */
export const logout = asyncHandler(async (req, res) => {
  // Clear refresh token in DB if authenticated
  const userId = req.user?.id || req.user?._id;
  if (userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }

  // Clear HTTP-Only cookies
  const clearCookieOptions = {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax',
    path: '/',
  };
  res.clearCookie('accessToken', clearCookieOptions);
  res.clearCookie('refreshToken', clearCookieOptions);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Logged out successfully. Session terminated.')
  );
});

/**
 * @desc Get current authenticated user profile & active workspace
 * @route GET /api/v1/auth/me
 * @access Protected
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('workspaceId');

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User account not found');
  }

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Current user retrieved successfully', {
      user: user.toJSON(),
      workspace: user.workspaceId,
    })
  );
});

/**
 * @desc Update user profile
 * @route PATCH /api/v1/auth/profile
 * @access Protected
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  if (name) user.name = name.trim();
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Profile updated successfully', {
      user: user.toJSON(),
    })
  );
});

/**
 * @desc Change password and rotate session tokens
 * @route POST /api/v1/auth/change-password
 * @access Protected
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password +refreshToken');
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Current password does not match');
  }

  user.password = newPassword;
  await user.save();

  // Issue new tokens after password change
  const { accessToken } = await issueTokensAndSetCookies(user, res);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Password updated successfully. Session refreshed.', {
      accessToken,
    })
  );
});
