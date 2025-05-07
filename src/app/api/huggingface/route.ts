import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { inputs } = await req.json();
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

    // Updated for Phi-3.5-mini-instruct
    const HF_MODEL = "microsoft/Phi-3-mini-4k-instruct";
    const URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

    try {
        const prompt = `[INST] 
**Expert Propagation Radio** :
- Structure OBLIGATOIRE :
  1. Tu es un assistant IA destiné à rédiger des documents techniques avec des formules mathématiques en télécommunications. 
Chaque fois que tu présentes une formule, entoure-la avec deux signes dollars (\$\$) au début et à la fin pour permettre son affichage avec KaTeX. 
N’utilise pas \`\\begin{equation}\` ni de syntaxe LaTeX supplémentaire non supportée par KaTeX. 

Par exemple :
Écris la formule suivante en KaTeX avec encadrement $$ : 
La perte de propagation est donnée par :
L = 32.44 + 20 \log_{10}(d) + 20 \log_{10}(f)  
  3. Erreur type (± dB)
  4. Comparaison avec 1 modèle concurrent
  5. Exemple réel (opérateur + année)  

Interdictions :
- Exemples non télécoms
- Paramètres environnementaux (température, humidité)
- Termes non normalisés (LOS_DISTANCE)

Vous êtes un expert en télécommunications. Répondez EXCLUSIVEMENT en français technique avec :

${inputs}
[/INST]`;

        // Phi-3 requires different parameters format
        const res = await fetch(URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: prompt, // Wrap in Llama3 instruction tags
                parameters: {
                    max_new_tokens: 500, // Reduced from 800 to avoid truncation
                    temperature: 0.3, // More focused than 0.4 (range 0.1-1.0)
                    top_p: 0.9, // Slightly lower for better focus (0.9-0.95)
                    repetition_penalty: 1.15, // Prevent loops
                    truncation: true, // Auto-truncate long inputs
                    do_sample: true, // Better quality than greedy
                }
            }),
        });

        const status = res.status;
        const text = await res.json();


        return NextResponse.json(
            {
                result: text,
                status,
            },
            { status: 200 }
        );
    } catch (err) {
        return NextResponse.json(
            {
                error: "Failed to process request",
                details: String(err)
            },
            { status: 500 }
        );
    }
}