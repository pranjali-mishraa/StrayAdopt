require("dotenv").config();
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const contextualizerModel = new ChatGoogleGenerativeAI({
    model: "gemini-3.5-flash-lite",
    temperature: 0,
    apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Contextualizes a user query using previous conversation history.
 * If the user's question references past context (e.g., "how old is he?", "can I adopt them?"),
 * it reformulates it into a complete, standalone question.
 *
 * @param {string} query - The latest query from the user.
 * @param {Array} historyMessages - Array of LangChain BaseMessage instances (HumanMessage, AIMessage).
 * @returns {Promise<string>} - Standalone reformulated query or original query.
 */
async function contextualizeUserQuery(query, historyMessages = []) {
    if (!historyMessages || historyMessages.length === 0) {
        return query;
    }

    try {
        // Take the latest 6 messages to keep context focused
        const recentMessages = historyMessages.slice(-6);

        const formattedHistory = recentMessages
            .map((msg) => {
                const role = msg._getType() === "human" ? "User" : "AI";
                return `${role}: ${msg.content}`;
            })
            .join("\n");

        const prompt = `You are an AI assistant for StrayAdopt, a stray pet adoption and rescue platform.

Given the chat history below and the latest user question, rephrase the user's question into a STANDALONE question that can be understood WITHOUT reading the chat history.

RULES:
1. Replace pronouns and ambiguous references (such as "he", "him", "she", "her", "it", "they", "them", "that dog", "that puppy", "that cat", "there", "the pet") with the specific animal names, breeds, locations, or topics mentioned in the chat history.
2. If the user's question is already complete, clear, and standalone, return it UNCHANGED.
3. Do NOT answer the question.
4. Do NOT add new facts or assumptions that were not discussed.
5. Return ONLY the standalone question text without quotes, prefixes, or explanations.

Chat History:
${formattedHistory}

Latest User Question:
${query}

Standalone Question:`;

        const response = await contextualizerModel.invoke(prompt);
        const reformulated = (response.content || "").toString().trim();

        if (reformulated && reformulated.length > 0) {
            return reformulated;
        }

        return query;
    } catch (error) {
        console.warn("[QueryContextualizer] Error reformulating query, using original query:", error.message);
        return query;
    }
}

module.exports = {
    contextualizeUserQuery,
};

