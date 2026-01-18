import React, { useState } from 'react';
import { Card, Input } from '../ui/CyberComponents';

import { Send, Sparkles } from 'lucide-react';
import { shipmentAssistant } from '../../lib/mcp/shipment-server';

export const AIAssistant: React.FC = () => {
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [loadingAi, setLoadingAi] = useState(false);

    const handleAiQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiPrompt.trim()) return;

        setLoadingAi(true);
        setAiResponse(null);
        try {
            const response = await shipmentAssistant.query(aiPrompt);
            setAiResponse(response);
        } catch (err) {
            setAiResponse("Failed to connect to AI mainframe.");
        } finally {
            setLoadingAi(false);
        }
    };

    return (
        <Card className="flex flex-col h-full bg-gradient-to-br from-white to-slate-100 dark:from-cyber-card dark:to-cyber-surface/80">
            <div className="flex items-center gap-2 mb-4 text-cyber-accentHover dark:text-cyber-neon">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Assistant</h3>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 bg-slate-100 dark:bg-black/20 rounded-lg p-4 border border-cyber-border min-h-[200px]">
                {!aiResponse ? (
                    <div className="text-slate-500 text-sm text-center mt-10">
                        Ask me about shipment statuses, delays, or route optimizations.
                    </div>
                ) : (
                    <div className="text-slate-700 dark:text-slate-200 text-sm whitespace-pre-line animate-[fadeIn_0.3s_ease-out]">
                        <span className="text-cyber-accentHover dark:text-cyber-neon font-bold block mb-2">TAC AI:</span>
                        {aiResponse}
                    </div>
                )}
            </div>

            <form onSubmit={handleAiQuery} className="relative">
                <Input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Query shipments..."
                    className="pr-10"
                    disabled={loadingAi}
                />
                <button
                    type="submit"
                    disabled={loadingAi}
                    className="absolute right-2 top-2 text-cyber-accent hover:text-cyber-accentHover dark:text-cyber-accent dark:hover:text-white transition-colors disabled:opacity-50"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </Card>
    );
};
