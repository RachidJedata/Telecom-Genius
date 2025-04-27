"use client"

import { useState } from "react"
import { Bot } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/UI/dialog"
import { Input } from "@/components/UI/input"
import { Button } from "./UI/button"
import { cn } from "@/lib/utils"
import MarkdownContent from "./markDown"


export function AiChatButton() {
  const welcomePrompts = [
    "Bonjour! Je suis votre assistant TelecomGenius. Comment puis-je vous aider avec les concepts de télécommunications aujourd'hui ?",
    "Salut! Bienvenue sur TelecomGenius. Quelles questions avez-vous sur les technologies de communication ?",
    "Bienvenue! TelecomGenius est là pour vous accompagner dans le monde des télécommunications. Comment puis-je vous être utile ?",
    "Bonjour et bienvenue! Des questions sur les réseaux ou la communication ? Je suis là pour vous aider !",
    "Salut! Je suis TelecomGenius, votre assistant en télécommunications. Comment puis-je vous aider aujourd'hui ?",
    "Coucou! Prêt à explorer les merveilles des télécommunications? Demandez-moi tout!",
    "Hello! Ici TelecomGenius, votre compagnon pour explorer l'univers des communications. Que souhaitez-vous savoir?",
    "Bienvenue à bord! Laissez TelecomGenius vous guider dans le monde fascinant des télécommunications.",
    "Salut! Vous avez des questions sur la 5G, les réseaux ou la fibre optique? Je suis là pour vous aider!"
  ];
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: welcomePrompts[Math.floor(Math.random() * welcomePrompts.length)],
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage = { role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/huggingface", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: input }),
      });

      const data = await res.json();
      const generatedText = data.result[0].generated_text;
      const cleanResponse = generatedText.split("<start_of_turn>model")[1]?.trim() || "";

      setMessages((prev) => [...prev, { role: "assistant", content: cleanResponse }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Error processing your request" }]);
    } finally {
      setIsLoading(false);
    }

  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300 hover:shadow-[0_0_15px_rgba(184,138,244,0.5)] z-50"
        aria-label="Chat with AI Assistant"
      >
        <Bot className="min-h-7 min-w-7 text-white" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] h-[600px] max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 py-2 border-b">
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Bot className="h-7 w-7" />
              TelecomGenius Assistant
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[90%] rounded-lg px-4 py-2  text-black dark:text-white",
                    message.role === "user" ? "bg-primary" : "bg-muted",
                  )}
                >
                  <MarkdownContent
                    content={message.content.trim()} />
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                  <div className="flex space-x-2 items-center">
                    <div
                      className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex p-4 border-t">
            <div className="flex w-full gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                Send
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

