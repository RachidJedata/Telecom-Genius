import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { inputs } = await req.json();
    console.log(inputs);

    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY; // Store in .env.local
    const HF_MODEL = "google/gemma-2b-it";
    // const HF_MODEL = "gpt2";     
    const message = `<start_of_turn>user
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
                    max_new_tokens: 200,  // Increased token limit for longer responses
                    temperature: 1.0,  // Higher value for more creativity
                    top_k: 50,  // Controls diversity by limiting token choices
                    top_p: 0.9,  // Nucleus sampling for more natural outputs
                    repetition_penalty: 1.2,  // Reduces repetition in generated text
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
