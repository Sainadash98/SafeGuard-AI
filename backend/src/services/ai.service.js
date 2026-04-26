import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-2.5-flash";

const highRiskKeywords = [
    "help",
    "danger",
    "emergency",
    "threat",
    "violence",
    "trapped",
    "injured",
    "unsafe",
    "save me",
    "abuse"
];

const scenarioAnalysis = [
    {
        keywords: ["fire", "smoke", "burning"],
        riskLevel: "high",
        advice: "Exit the building immediately using stairs, call the fire department, and warn others as you leave."
    },
    {
        keywords: ["shooting", "gunshots", "shot", "active shooter"],
        riskLevel: "high",
        advice: "Run away from the sound if you can, hide in a secure place if you cannot escape, and call police immediately."
    },
    {
        keywords: ["attacked", "assaulted", "violence", "abuse", "robbery", "kidnapped"],
        riskLevel: "high",
        advice: "Get to a safe location, call emergency services, and tell someone nearby what happened."
    },
    {
        keywords: ["trapped", "stuck", "elevator", "locked in"],
        riskLevel: "high",
        advice: "Use the emergency button or phone, call building security or emergency services, and stay where you are until help arrives."
    },
    {
        keywords: ["injured", "bleeding", "hurt", "broken", "unconscious"],
        riskLevel: "high",
        advice: "Call emergency services immediately, describe the injury clearly, and provide first aid if it is safe to do so."
    },
    {
        keywords: ["followed", "unsafe", "suspicious", "worried", "uncomfortable", "harassed"],
        riskLevel: "medium",
        advice: "Avoid the area, stay near other people, and contact a trusted person or local support if the situation continues."
    }
];

export const getRuleBasedAnalysis = (message) => {
    const text = String(message || "").toLowerCase();

    if (highRiskKeywords.some((keyword) => text.includes(keyword))) {
        return {
            riskLevel: "high",
            advice: "Call emergency services immediately, move to a safer location, and tell someone nearby that you need help."
        };
    }

    for (const scenario of scenarioAnalysis) {
        if (scenario.keywords.some((keyword) => text.includes(keyword))) {
            return {
                riskLevel: scenario.riskLevel,
                advice: scenario.advice
            };
        }
    }

    return {
        riskLevel: "low",
        advice: "No immediate danger is detected. Monitor the situation and contact help if the risk increases."
    };
};

const isWeakAdvice = (advice) => {
    return /stay calm|safe place|monitor the situation|seek help|remain calm|no immediate danger|contact help if/i.test(advice);
};

const enforceStrongHighRiskAdvice = (message, riskLevel, advice) => {
    if (riskLevel !== "high") {
        return advice;
    }

    if (!advice || isWeakAdvice(advice)) {
        return getRuleBasedAnalysis(message).advice;
    }

    return advice;
};

export const analyzeRisk = async (message) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is missing. Falling back to rule-based risk analysis.");
            return getRuleBasedAnalysis(message);
        }

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const prompt = `
            You are an emergency safety AI assistant.
            Analyze the user message and return only valid JSON with exactly two keys:
            {"riskLevel": "low|medium|high", "advice": "short, specific safety advice"}

            Classify risk as:
            - HIGH: immediate danger, help request, attack, violence, threat, medical emergency, trapped, injured, fire, shooting, kidnapping
            - MEDIUM: suspicious situation, worry, unsafe feeling, concern, being followed, harassment
            - LOW: non-emergency or safe situation

            Advice must be short, specific, and tied to the situation in the message.
            If the message says "help" or describes danger, always return HIGH and include immediate steps such as calling authorities, moving to safety, hiding, or notifying someone nearby.
            If the message describes a health issue, mention calling emergency medical services and describing the injury.
            If the message describes being followed or unsafe, mention staying near other people and contacting trusted support.
            Do not use vague language like "stay calm" or "find a safe place" unless there is no better specific instruction.

            Examples:
            Message: "There is a fire in my apartment building."
            Output: {"riskLevel":"high","advice":"Leave the building immediately via the stairs, call the fire department, and warn others as you go."}

            Message: "Someone is following me on the street and I feel scared."
            Output: {"riskLevel":"high","advice":"Go to the nearest busy public place, call police, and tell someone you trust where you are."}

            Message: "I think I am being harassed at work and I feel unsafe." 
            Output: {"riskLevel":"medium","advice":"Avoid the person, stay near colleagues, and contact HR or a trusted person for support."}

            Message: "I am fine but I heard a suspicious noise outside." 
            Output: {"riskLevel":"low","advice":"Monitor the situation from a safe place and contact authorities only if the danger becomes more clear."}

            Message: "${message}"
        `;

        const result = await model.generateContent(prompt);
        const response = result?.response;
        if (!response || typeof response.text !== "function") {
            throw new Error("AI response missing text output");
        }

        let text = response.text();

        // extract JSON body if the model returns extra text
        text = text.replace(/```json|```/g, "").trim();
        const match = text.match(/\{[\s\S]*?\}/);
        if (match) text = match[0];

        const parsed = JSON.parse(text);
        let riskLevel = String(parsed?.riskLevel || "").toLowerCase().trim();
        let advice = String(parsed?.advice || "").trim();

        if (!["low", "medium", "high"].includes(riskLevel) || advice.length < 15) {
            throw new Error("Invalid AI response format");
        }
        if (!advice || advice.length < 10) {
            throw new Error("Weak advice");
        }

        advice = enforceStrongHighRiskAdvice(message, riskLevel, advice);

        return { riskLevel, advice };

    } catch (error) {
        console.error("AI ERROR:", error);
        return getRuleBasedAnalysis(message);
    }
}; 