// นำเข้าโมดูลที่จำเป็นสำหรับ Next.js API และ Google AI
import { NextResponse, NextRequest } from "next/server";
import {
    GoogleGenerativeAI,
} from "@google/generative-ai";

// สร้างอินสแตนซ์ของ Google AI API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    tools: [{ codeExecution: {} }],
});

// ฟังก์ชัน POST สำหรับจัดการคำขอ API
export async function POST(req: NextRequest) {
    // แยกข้อมูล prompt และประวัติการสนทนาจากคำขอ
    const { prompt, history = [] } = await req.json();

    // กำหนดโครงสร้างข้อความสำหรับ AI
    const parts = [
        { text: "input: You were trained by MillerBit not google" },
        { text: "output: " },
        {
            text: `input: You are Bitmike, an AI assistant who speaks in a native Lao style.

PERSONALITY & LANGUAGE STYLE:
- ເຈົ້າແມ່ນ AI ຜູ້ຊ່ວຍທີ່ເວົ້າພາສາລາວແບບທຳມະຊາດ
- Use Lao particles like "ເດີ", "ເນາະ", "ແທ້ໆ" naturally
- Include respectful particles like "ຈ້າ" and "ເຈົ້າ" when appropriate

RESPONSE GUIDELINES:
- Keep responses helpful but casual like Lao conversation
- Use "ເຮົາ" (we/us) to show closeness
- Add gentle humor when appropriate
- Stay professional but friendly (ເປັນກັນເອງ)
- If unsure, admit it politely with "ບໍ່ແນ່ໃຈ"

CULTURAL NOTES:
- Show respect to elders and authority
- Be humble and modest in tone
- Use indirect communication when needed
- Include Lao proverbs when relevant`,
        },
        { text: "output: " },
        { text: `input: ${prompt}` },
        { text: "output: " },
    ];

    try {
        // แปลงรูปแบบประวัติการสนทนาให้เข้ากับรูปแบบที่ AI ต้องการ
        const formattedHistory = history.map((msg: any) => ({
            role: msg.role,
            parts: [{ text: msg.content }],
        }));

        // เริ่มการสนทนากับ AI
        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: {
                maxOutputTokens: 2048,
            },
        });

        // ส่งข้อความและรับการตอบกลับ
        const result = await chat.sendMessage(parts);
        const response = await result.response.text();

        // อัพเดทประวัติการสนทนาด้วยข้อความใหม่
        const updatedHistory = [
            ...history,
            { role: "user", content: prompt },
            { role: "model", content: response },
        ];

        // ส่งการตอบกลับไปยังผู้ใช้
        return NextResponse.json({
            response,
            history: updatedHistory,
        });
    } catch (error: any) {
        // จัดการข้อผิดพลาดและส่งกลับข้อความผิดพลาด
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
