const User = require("../models/Account.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// POST/user/signup - create user account
const signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // console.log("Guest data", name, email, password);

    let user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      data: err,
    });
  }
};

// POST/user/emailAuth - check if account already registered
const verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("User's Email", email);
    const [user] = await User.find({ email: email });

    if (user) {
      return res.status(201).json({
        success: true,
        message: "User Already Registered. Go to signin page",
        data: user,
      });
    }
  } catch (err) {
    res.status(404).json({
      success: false,
      data: err,
    });
  }
};

// POST/user/auth- login registered user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log("Email auth", email);

    const [user] = await User.findOne({ email });
    // console.log("User auth", user);

    if (!user) {
      return res
        .status(404)
        .json({ error: "Email not found. User not registered" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials" });

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true, // Prevents access via JavaScript
      secure: process.env.NODE_ENV === "production", // Ensures it's only sent over HTTPS in production
      sameSite: "Strict", // Prevents CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiration
    });

    // if (user.password !== password) {
    //   return res.status(404).json({
    //     success: false,
    //     error: "Password entered is Incorrect",
    //   });
    // }
    // console.log("Verified password", password);

    const generateToken = (user) => {
      return jwt.sign({ userId: user.userId }, process.env.JWT_SECRET_KEY, {
        expiresIn: "7d",
      });
    };

    res.status(201).json({
      success: true,
      message: "Login successful",
      user: { id: user.userId, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }

  // console.log("Token", token);

  // let result = {
  //   success: true,
  //   data: {
  //     token,
  //     user,
  //   },
  // };
  // return res.status(201).json({ success: true, data: result });
};

module.exports = {
  signupUser,
  verifyEmail,
  loginUser,
};
