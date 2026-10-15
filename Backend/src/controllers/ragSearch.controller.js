const {
    answerUserQuery,
    resetSessionHistory,
    getSessionHistory,
} = require("../services/raglanchain/rag.service");

async function ragSearch(req, res) {
    try {
        const { query, sessionId } = req.body;

        if (!query || !query.trim()) {
            return res.status(400).json({
                success: false,
                message: "Query is required",
            });
        }

        // Use supplied sessionId or derive one
        const resolvedSessionId =
            sessionId ||
            (req.user ? `user_${req.user._id}` : `session_${Date.now()}`);

        const result = await answerUserQuery(query.trim(), resolvedSessionId);

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("RAG search error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to process your query",
        });
    }
}

async function getHistory(req, res) {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: "Session ID is required",
            });
        }

        const history = await getSessionHistory(sessionId);

        return res.status(200).json({
            success: true,
            data: history,
        });
    } catch (error) {
        console.error("Get chat history error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch chat history",
        });
    }
}

async function clearHistory(req, res) {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: "Session ID is required",
            });
        }

        await resetSessionHistory(sessionId);

        return res.status(200).json({
            success: true,
            message: "Chat history cleared successfully",
        });
    } catch (error) {
        console.error("Clear chat history error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to clear chat history",
        });
    }
}

module.exports = {
    ragSearch,
    getHistory,
    clearHistory,
};
