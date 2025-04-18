import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { inputs } = await req.json();
    console.log(inputs);

    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY; // Store in .env.local
    const HF_MODEL = "google/gemma-2b-it";
    // const HF_MODEL = "gpt2";     
    const message =
        `<start_of_turn>user
[INST] Answer EXCLUSIVELY in technical bullet points about telecom in french:
${inputs} 
Do NOT include introductions or conclusions <end_of_turn>
<start_of_turn>model
`;
    try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: message,
                parameters: {
                    max_new_tokens: 200,      // Enough tokens for detailed responses
                    temperature: 0.6,         // Lower temperature for more focused outputs
                    top_k: 35,                // Reduce token options for sharper results
                    top_p: 0.9,               // Nucleus sampling to keep diversity
                    repetition_penalty: 1.1,  // Slightly relaxed to ease repetition constraints
                },
            }),

        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(result);
        return NextResponse.json({ result }, { status: 200 });
    } catch (error) {
        console.error("Hugging Face API error:", error);
        return NextResponse.json({ error: "Error processing request" }, { status: 500 });
    }
}
