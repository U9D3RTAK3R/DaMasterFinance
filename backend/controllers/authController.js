const User = require("../models/User");
const jwt = require("jsonwebtoken");
const express = require('express');
const app = express();

//Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn: "1h" });
};

exports.registerUser = async (req, res) => {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ message: 'Missing or invalid request body' });
    }

    const { fullName, email, password, profileImageUrl } = req.body;
    
    if (!fullName || !email || !password){
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use "});
        }

        const user = await User.create({
            fullName,
            email,
            password,
            profileImageUrl,
        });

        res.status(201).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        });
    } catch (err) {
        res
            .status(500)
            .json({ message: "Error registering user", error: err.message });
    }
};

exports.loginUser = async (req, res) => {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ message: 'Missing or invalid request body' });
    }

    const { email, password } = req.body;
    
    if (!email || !password){
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: "Invalid Credentials"});
        }

        res.status(200).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        });
    } catch (err) {
        res
            .status(500)
            .json({ message: "Error registering user", error: err.message });
    }
};

exports.getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(400).json({ message: "User Not Found"});
        }

        res.status(200).json(user);
    } catch (err) {
        res
            .status(500)
            .json({ message: "Error registering user", error: err.message });
    }
};