"use client";
import { useState } from "react";
import ReactMarkdown from 'react-markdown';

export default function HuggingFaceChat() {
    const [input, setInput] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResponse('');
        try {
            const res = await fetch("/api/huggingface", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inputs: input }),
            });

            const data = await res.json();

            const generatedText = data.result[0].generated_text;
            const cleanResponse = generatedText.split("<start_of_turn>model")[1]?.trim() || "";


            setResponse(cleanResponse);

            /*
            for Open AI ,here is the reponse but remove cleanResponse first
            and change API endpoint to api/openai
            setResponse(data.result.choices[0].text);
             */
        } catch (error) {
            console.error("Error:", error);
            setResponse("Error processing your request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <form onSubmit={handleSubmit} className="mb-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="w-full p-2 border rounded"
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Send"}
                </button>
            </form>

            {response && <div className="p-4 bg-gray-100 rounded">
                <ReactMarkdown>{response}</ReactMarkdown>
            </div>}
        </div>
    );
}
