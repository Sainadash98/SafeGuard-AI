// import jwt from "jsonwebtoken";

// const authMiddleware = (req, res, next) => {
//     try {
//         const token = req.headers.authorization;

//         if (!token) {
//             return res.status(401).json({ message: "No token" });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         req.userId = decoded.userId;

//         next();

//     } catch (error) {
//         return res.status(401).json({ message: "Invalid token" });
//     }
// };

// export default authMiddleware;

import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        console.log("HEADER:", authHeader);

        if (!authHeader) {
            return res.status(401).json({ message: "No token" });
        }

        const token = authHeader.split(" ")[1];

        console.log("TOKEN:", token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("DECODED:", decoded);

        req.userId = decoded.userId;

        next();
    } catch (error) {
        console.log("JWT ERROR:", error.message); // 👈 THIS IS KEY
        return res.status(401).json({ message: "Invalid token" });
    }
};

export default authMiddleware; 