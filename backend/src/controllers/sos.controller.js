import Sos from "../models/sos.model.js";
import User from "../models/user.model.js";
import { analyzeRisk } from "../services/ai.service.js";

import redis from "../config/redis.js";
import { sendAlert } from "../services/alert.service.js";
import { sosQueue } from "../config/queue.js";
import { getRuleBasedAnalysis } from "../services/ai.service.js";

export const createSos = async (req, res) => {
    try {
        const { message, lat, lng } = req.body;
        if (!message || !lat || !lng) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // const aiResult = await analyzeRisk(message);
        const aiResult = getRuleBasedAnalysis(message);
        analyzeRisk(message)
            .then((aiResult) => {
                console.log("AI (background):", aiResult);
            })
            .catch((error) => {
                console.error("AI (background) error:", error);
            });
        let riskLevel = aiResult?.riskLevel || "low";
        let advice = aiResult?.advice || "If you are in immediate danger, call emergency services and move to a safe location.";

        const text = message.toLowerCase();

        // fallback safety override
        if (
            text.includes("help") ||
            text.includes("danger") ||
            text.includes("emergency") ||
            text.includes("threat") ||
            text.includes("violence") ||
            text.includes("trapped") ||
            text.includes("injured") ||
            text.includes("unsafe") ||
            text.includes("worried") ||
            text.includes("suspicious") ||
            text.includes("scared") ||
            text.includes("save me")
        ) {
            riskLevel = "high";
        }

        const isGenericAdvice = (value) => {
            return /stay calm|safe place|seek help|remain calm|find a safe place/i.test(value);
        };

        const defaultAdviceByRisk = (level) => {
            if (level === "high") {
                return "Call emergency services immediately, move to a safe location, and tell someone nearby you need help.";
            }
            if (level === "medium") {
                return "Avoid the area, stay aware of your surroundings, and contact a trusted person or local support.";
            }
            return "Continue monitoring the situation and seek help if the risk increases.";
        };

        if (!advice || typeof advice !== "string" || advice.trim().length < 15 || (riskLevel === "high" && isGenericAdvice(advice))) {
            advice = defaultAdviceByRisk(riskLevel);
        }

        const sosEvent = await Sos.create({
            userId: req.userId,
            message,
            location: { lat, lng },
            riskLevel
        });

        const user = await User.findById(req.userId);

        await sosQueue.add("send-alert", {
            userId: req.userId,
            message,
            riskLevel,
            lat,
            lng
        });

        res.status(201).json({
            success: true,
            message: "Sos triggered",
            data: {
                riskLevel,
                advice,
                sosId: sosEvent._id
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};