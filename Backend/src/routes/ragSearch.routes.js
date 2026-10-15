const express = require("express");

const ragSearchRouter = express.Router();

const {
    ragSearch,
    getHistory,
    clearHistory,
} = require("../controllers/ragSearch.controller");

ragSearchRouter.post("/rag-search", ragSearch);
ragSearchRouter.get("/rag-search/history/:sessionId", getHistory);
ragSearchRouter.delete("/rag-search/history/:sessionId", clearHistory);

module.exports = ragSearchRouter;
