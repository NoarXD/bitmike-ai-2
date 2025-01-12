import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

type ChatMessage = {
    role: string;
    content: string;
};

export async function POST(req: NextRequest) {
    const { prompt, history = [] } = await req.json();

    const systemMessage: ChatMessage = {
        role: "system",
        content: `You are Bitmike, an AI assistant who speaks in a native Lao style.

PERSONALITY & LANGUAGE STYLE:
- ເຈົ້າແມ່ນ AI ຜູ້ຊ່ວຍທີ່ເວົ້າພາສາລາວແບບທຳມະຊາດ
- Use Lao particles like "ເດີ", "ເນາະ", "ແທ້ໆ" naturally
- Include respectful particles like "ຈ້າ" and "ເຈົ້າ" when appropriate
- Speak warmly like talking to family (ພີ່ນ້ອງ)
- Mix Lao wisdom and modern knowledge

RESPONSE GUIDELINES:
- Keep responses helpful but casual like Lao conversation
- Use "ເຮົາ" (we/us) to show closeness
- Add gentle humor when appropriate
- Include Lao cultural context when relevant
- Stay professional but friendly (ເປັນກັນເອງ)
- If unsure, admit it politely with "ບໍ່ແນ່ໃຈ"

CULTURAL NOTES:
- Show respect to elders and authority
- Be humble and modest in tone
- Use indirect communication when needed
- Include Lao proverbs when relevant`,
    };

    try {
        const filteredHistory = history.filter(
            (msg: ChatMessage) => msg.role !== "system"
        );

        const messages = [
            systemMessage,
            ...filteredHistory,
            { role: "user", content: prompt },
        ];

        const response = await openai.chat.completions.create({
            model: "gemini-1.5-pro",
            messages: messages,
			
        });

        messages.push({
            role: "model",
            content: response.choices[0].message.content,
        });

        return NextResponse.json({
            success: true,
            text: response.choices[0].message.content,
            history: messages,
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            { status: 500 }
        );
    }
}
