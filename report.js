import OpenAI from "openai";
import express from express;
import bodyParser from "body-parser";

const app= express();
app.use(bodyParser.json());

async function generateReport(qaPairs) {
    const results = [];
    for (const { question, userAnswer } of qaPairs) {
        const evaluation = await evaluateAnswer(question, userAnswer);

        results.push({
            "Question": question,
            "User Answer": userAnswer,
            "Reference Answer": evaluation.referenceAnswer,
            "Similarity Score": evaluation.parsed.similarity,
            "Missing Points": evaluation.parsed.missing.join(" . ")
        });
    }
    return results;
}

const qaPairs = [
    {
        question: "What will be the future scope of your project?",
        userAnswer: "It can be expanded to support more users and provide better security."
    }
];

app.post("/getAnalysis", async (req, res) => {
    try {
        const qaPairs = req.body.qaPairs;
        if (!qaPairs || !Array.isArray(qaPairs)) {
            return res.status(400).json({ error: "qaPairs must be an array" });
        }

        const report = await generateReport(qaPairs);
        res.json({ success: true, report });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(3000,()=>{
    console.log("Listenin on port 3000");
})