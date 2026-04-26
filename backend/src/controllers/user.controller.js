import User from "../models/user.model.js";
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber } = req.body;
        if(!fullName || !email || !password || !phoneNumber) {
            return res.status(400).json({ 
                message: "Somthing is missing",
                success: false 
            });
        }
        const user = await User.findOne({ email });
        if(user) {
            return res.status(400).json({
                message: "User already exists",
                success: false
            });
        }

        if(password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            phoneNumber
        });
        return res.status(201).json({
            message: "User registered successfully",
            success: true,
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                phoneNumber: newUser.phoneNumber
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            message: "Error while registering user",
            success: false
        })
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // check input
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password required",
                success: false
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials",
                success: false
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials",
                success: false
            });
        }

        // generate token
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({
                message: "JWT secret not configured",
                success: false
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            jwtSecret,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Login successful",
            success: true,
            token,
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Login failed",
            success: false
        });
    }
}; 
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile" });
    }
};
export const updateProfile = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            req.body,
            { new: true }
        ).select("-password");

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
};
export const logout = (req, res) => {
    res.json({ message: "Logout successful" });
};
export const addContact = async (req, res) => {
    try {
        const { name, phoneNumber, email } = req.body;
        if(!name || !phoneNumber) {
            return res.status(400).json({ message: "Name and phone number are required" });
        }

        const user = await User.findById(req.userId);
        user.trustedContacts.push({ name, phoneNumber, email });
        await user.save();

        return res.json({ 
            success: true,
            message: "Contact added", 
            contacts: { name, phoneNumber, email } 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to add contact" });
    }
}