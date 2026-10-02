const { getChatbotResponse } = require("../services/aiService");


const chatWithBot = async (req, res) => {
    try {
        const { message } = req.body;

        // Validate message
        if (
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        // Get response from AI service
        const response = await getChatbotResponse(message.trim());

        return res.status(200).json({
            success: true,
            response
        });

    } catch (error) {
        console.error("AI Chatbot Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to process your request"
        });
    }
};


module.exports = {
    chatWithBot
};