import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function evaluateAnswer(question, userAnswer) {
    const referencePrompt = `
    You are an expert evaluator. 
    Given the following question, generate a high-quality reference answer that covers all key points.

    Question: "${question}"
    Reference Answer:
    `;

    const referenceCompletion = await client.chat.completions.create({
        model: " ", 
        messages: [{ role: "user", content: referencePrompt }],
        temperature: 0,
    });

    const referenceAnswer = referenceCompletion.choices[0].message.content.trim();
    const evalPrompt = `

    You are an evaluator for presentation answers.
    Question: "${question}"
    User's Answer: "${userAnswer}"
    Reference Answer: "${referenceAnswer}"

    Tasks:
    1. Give a similarity score between the user's answer and the reference answer between 0 to 1.
    2. List out the missing sentences/points that could improve the user's answer.
    3. Return the output in JSON with fields: similarity, missing.
    `;

    const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: evalPrompt }],
        temperature: 0,
    });

    const text = completion.choices[0].message.content;

    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch {
        parsed = { similarity: null, missing: [text] };
    }

    return { parsed, referenceAnswer };
}


async function generateReport(qaPairs) {
    const results = [];
    for (const { question, userAnswer } of qaPairs) {
        const evaluation = await evaluateAnswer(question, userAnswer);

        results.push({
            "Question": question,
            "User Answer": userAnswer,
            "Reference Answer": evaluation.referenceAnswer,
            "Similarity Score": evaluation.similarity,
            "Missing Points": evaluation.missing.join(" . ")
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

const run = async () => {
    const report = await generateReport(qaPairs);
    console.table(report);
};

run();
