import apiFetch from "./api";

/**
 * Send a message to the AI Assistant
 *
 * @param {string} message - User's message
 * @returns {Promise<Object>} AI API response
 */
export const sendAIMessage = async (message) => {
  try {
    if (typeof message !== "string" || !message.trim()) {
      throw new Error("Message is required");
    }

    const data = await apiFetch("/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        message: message.trim(),
      }),
    });

    return data;
  } catch (error) {
    console.error("AI Service Error:", error);

    throw new Error(
      error?.message ||
      "Unable to connect with AI Assistant"
    );
  }
};