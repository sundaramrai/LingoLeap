const User = require('../models/user');
const Token = require('../models/token');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash,
} = require('../utils');
const crypto = require('crypto');

const register = async (req, res) => {
  const { email, name, password } = req.body;

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists');
  }
  const verificationToken = crypto.randomBytes(40).toString('hex');
  console.log(verificationToken);

  const user = await User.create({
    name,
    email,
    password,
    verificationToken,
  });
  const origin =
    process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_API_URL + '/api/v1'
      : `http://${process.env.DOMAIN}/api/v1`;
  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin,
  });
  res.status(StatusCodes.CREATED).json({
    msg: 'Success! Please check your email to verify account',
  });
};

const verifyEmail = async (req, res) => {
  const { token, id } = req.query;
  if (!token || !id) {
    throw new CustomError.BadRequestError('Invalid verification link');
  }
  const user = await User.findById(id);
  if (!user) {
    throw new CustomError.UnauthenticatedError('Verification Failed');
  }
  const isMatch = await require('bcryptjs').compare(token, user.verifyToken);
  if (!isMatch || user.verifyTokenExpiry < Date.now()) {
    throw new CustomError.UnauthenticatedError('Verification Failed or Token Expired');
  }

  user.isVerified = true;
  user.verified = Date.now();
  user.verifyToken = '';
  user.verifyTokenExpiry = null;
  await user.save();

  res.status(StatusCodes.OK).json({ msg: 'Email Verified' });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password');
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }
  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError('Please verify your email');
  }
  const tokenUser = createTokenUser(user);

  let refreshToken = '';
  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString('hex');
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await Token.create(userToken);

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });

  res.cookie('accessToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie('refreshToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError('Please provide valid email');
  }

  const user = await User.findOne({ email });

  if (user) {
    const passwordToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = require('bcryptjs').hashSync(passwordToken, 10);
    const origin =
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_API_URL + '/api/v1'
        : `http://${process.env.DOMAIN}/api/v1`;
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
      userId: user._id,
      origin,
    });

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = hashedToken;
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Please check your email for reset password link' });
};

const resetPassword = async (req, res) => {
  const { token, id, password } = req.query;
  if (!token || !id || !password) {
    throw new CustomError.BadRequestError('Please provide all values');
  }
  const user = await User.findById(id);

  if (user) {
    const isMatch = await require('bcryptjs').compare(token, user.passwordToken);
    const currentDate = new Date();

    if (
      isMatch &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
      return res.send('reset password');
    }
  }

  throw new CustomError.UnauthenticatedError('Invalid or expired reset token');
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
