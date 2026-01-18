
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { OpenRouter } from "@openrouter/sdk";
import { motion } from "@/lib/motion";

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

export function TACBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Khurumjari! I'm TAC-Bot. How can I assist you with your logistics needs today?",
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState("");
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Initialize OpenRouter
    const openrouter = new OpenRouter({
        apiKey: "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",
    });

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user" as const, content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const chatMessages = [
                {
                    role: "system" as const,
                    content: `You are TAC-Bot, a professional and polite AI logistics assistant for TAC Cargo (Tapan Associate Cargo).
                    
                    **Language & Greeting Policy**:
                    - **Initial Greeting**: "Khurumjari!" (Hello). You generally don't need to say this again after the first message.
                    - **Gratitude**: ALWAYS use "**Thagatchari**" instead of "Thank you" or "Thanks". Never use English thanks.
                    - **Tone**: Be very polite and professional.

                    **Business Context**:
                    - **Head Office**: Paona Bazar, Imphal, Manipur - 795001.
                    - **Phone**: +91 98620 12345 (Mon-Sat, 9AM-6PM).
                    - **Email**: support@taccargo.com.
                    - **Services**: Logistics, cargo shipment, tracking.

                    **Interaction Logic**:
                    1. **General Queries** (Hours, Location, Services): Answer immediately with the info above.
                    2. **Tracking/Status Inquiries**:
                       - IF the user asks about a specific package, shipment, or AWB status:
                         - You MUST politely ask for their **Full Name**, **Phone Number**, and **AWB Number** if not already provided.
                       - Once provided (or if simulates), pretend to check the status and give a helpful response.
                    
                    Keep responses concise, helpful, and culturally appropriate.`
                },
                ...messages,
                userMessage
            ];

            const stream = await openrouter.chat.send({
                model: "z-ai/glm-4.5-air:free",
                messages: chatMessages,
                stream: true
            });

            let botResponse = "";
            setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    botResponse += content;
                    setMessages((prev) => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1].content = botResponse;
                        return newMessages;
                    });
                }
            }

        } catch (error) {
            console.error("Failed to send message:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "I apologize, but I'm having trouble connecting right now. Please try again later." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="fixed bottom-6 right-6 z-50">
                    <span className="relative flex h-14 w-14">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-20 delay-1000"></span>
                        <Button
                            size="icon"
                            className="relative h-14 w-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_40px_rgb(var(--primary),0.3)] bg-background border border-border/50 text-foreground transition-all duration-500 hover:scale-110"
                        >
                            <Sparkles className="h-6 w-6 text-primary fill-primary/20" />
                        </Button>
                    </span>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] h-[600px] p-0 gap-0 border-none shadow-2xl bg-gradient-to-b from-[#fdfbfd] to-[#fef6fa] dark:from-background dark:to-background overflow-hidden flex flex-col">

                {/* Minimalist Gradient Background Effect */}
                <div className="absolute top-[-150px] left-[-100px] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-40 mix-blend-multiply dark:mix-blend-screen" />

                {/* Header */}
                <div className="flex flex-col items-center justify-center pt-8 pb-4 relative z-10">
                    <div className="relative mb-4">
                        <Sparkles className="h-8 w-8 text-foreground fill-primary/20" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-1 -right-1 w-3 h-3 text-primary"
                        >
                            ✦
                        </motion.div>
                    </div>
                    <h2 className="text-xl font-light tracking-tight text-foreground/90">Ask our TAC Bot</h2>
                </div>

                {/* Content Area */}
                <div className="flex-1 relative z-10 flex flex-col overflow-hidden">
                    <motion.div
                        key="chat"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col h-full"
                    >
                        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
                            <div className="space-y-6 pb-4 pt-2">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        {msg.role === "assistant" && (
                                            <div className="flex flex-col gap-1 max-w-[85%]">
                                                <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider ml-1">TAC Bot</span>
                                                <div className="bg-white/60 dark:bg-muted/30 backdrop-blur-md rounded-2xl rounded-tl-sm px-5 py-3 text-sm text-foreground shadow-sm">
                                                    {msg.content}
                                                </div>
                                            </div>
                                        )}
                                        {msg.role === "user" && (
                                            <div className="bg-foreground text-background rounded-2xl rounded-tr-sm px-5 py-3 text-sm shadow-md max-w-[85%]">
                                                {msg.content}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/60 dark:bg-muted/30 backdrop-blur-md rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                            <div className="flex gap-1.5">
                                                <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <div className="p-4 bg-transparent">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage();
                                }}
                                className="relative"
                            >
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask me anything..."
                                    className="h-14 pl-6 pr-14 rounded-full border-muted-foreground/10 bg-white/80 dark:bg-black/20 shadow-[0_4px_20px_rgb(0,0,0,0.04)] focus-visible:ring-1 focus-visible:ring-primary/20 text-base"
                                    disabled={isLoading}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={isLoading || !input.trim()}
                                    className="absolute right-2 top-2 h-10 w-10 rounded-full bg-transparent text-foreground hover:bg-muted/20 shadow-none"
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
