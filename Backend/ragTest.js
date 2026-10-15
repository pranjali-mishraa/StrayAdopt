require("dotenv").config();

const mongoose = require("mongoose");
const { answerUserQuery } = require("./src/services/raglanchain/rag.service");

async function main() {
    try {
        // ==============================
        // CONNECT TO MONGODB
        // ==============================
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        const testSessionId = `test_session_${Date.now()}`;
        console.log(`Using Session ID: ${testSessionId}\n`);

        // ==========================================
        // TURN 1: INITIAL QUERY
        // ==========================================
        const query1 =
            "I found a one month old puppy at ABES College. How should I take care of it?";

        console.log("==========================================");
        console.log("TURN 1 - USER QUERY:");
        console.log(query1);
        console.log("==========================================");

        const result1 = await answerUserQuery(query1, testSessionId);

        console.log("\n--- Turn 1 AI Answer ---");
        console.log(result1.answer);

        // ==========================================
        // TURN 2: FOLLOW-UP QUERY (Requires Context)
        // ==========================================
        const query2 = "What about vaccination for him? When should I start?";

        console.log("\n==========================================");
        console.log("TURN 2 - FOLLOW-UP QUERY (using pronouns 'him'):");
        console.log(query2);
        console.log("==========================================");

        const result2 = await answerUserQuery(query2, testSessionId);

        console.log("\n--- Standalone Query Reformulated by Contextualizer ---");
        console.log(result2.standaloneQuery);

        console.log("\n--- Turn 2 AI Answer (Maintaining Context) ---");
        console.log(result2.answer);

    } catch (error) {
        console.error("\nRAG test failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\nMongoDB disconnected");
    }
}

main();
