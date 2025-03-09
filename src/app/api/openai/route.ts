// src/app/api/openai/route.ts

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    const { prompt } = await req.json();
    try {
        // Use Chat Completions endpoint with "gpt-3.5-turbo"
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 100,
        });

        return NextResponse.json({
            status: 200,
            result: completion,
        });
    } catch (error) {
        console.error("OpenAI API error:", error);
        return NextResponse.json({
            status: 500,
            error: "Error processing request",
        });
    }
}
