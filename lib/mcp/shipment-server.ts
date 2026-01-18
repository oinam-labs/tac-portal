// This file mocks the MCP server interaction using Google Gemini API to "query" shipment data naturally.
// In a real app, this would connect to a backend proxying requests to an MCP server.

import { GoogleGenAI } from "@google/genai";
import { db } from "../mock-db";

export class ShipmentAssistant {
    private ai: GoogleGenAI;
    private apiKey: string;

    constructor() {
        // NOTE: In a real app, strict error handling for missing key is needed.
        // We assume process.env.API_KEY is available via the environment.
        this.apiKey = process.env.API_KEY || '';
        this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }

    async query(userPrompt: string): Promise<string> {
        if (!this.apiKey) {
            return "API Key not configured. Unable to query AI assistant.";
        }

        try {
            // Get real-time snapshot of data
            const shipments = db.getShipments();
            const exceptions = db.getExceptions();
            const manifests = db.getManifests();

            // We simulate an MCP tool use by providing the context directly to the model
            const systemInstruction = `
            You are the TAC Cargo Logistics AI Assistant (Enterprise Edition).
            
            OPERATIONAL CONTEXT:
            - Origin Hub: IMPHAL (IMF)
            - Destination Hub: NEW_DELHI (DEL)
            
            REAL-TIME DATA ACCESS:
            - Shipments: ${shipments.length} records available.
            - Active Exceptions: ${exceptions.length} records.
            - Manifests: ${manifests.length} records.

            DATA SNAPSHOT:
            ${JSON.stringify({ 
                recent_shipments: shipments.slice(0, 10), // Limit context window
                active_exceptions: exceptions.filter(e => e.status === 'OPEN'),
                active_manifests: manifests.filter(m => m.status !== 'ARRIVED')
            })}

            INSTRUCTIONS:
            Answer the user's questions about logistics operations.
            Be concise, professional, and use a cyber-futuristic tone.
            If asked about a specific tracking number (AWB), look it up in the snapshot.
            If asked for status summaries, calculate them from the data.
            `;

            const response = await this.ai.models.generateContent({
                model: 'gemini-3-flash-preview', 
                contents: userPrompt,
                config: {
                    systemInstruction: systemInstruction,
                }
            });

            return response.text || "No response generated.";
        } catch (error) {
            console.error("AI Query Error:", error);
            return "System Error: AI Link Disrupted.";
        }
    }
}

export const shipmentAssistant = new ShipmentAssistant();