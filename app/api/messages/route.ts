import { NextResponse } from "next/server";
import { appendMessage, readMessages } from "@/lib/data-store";
import { newMessageId } from "@/lib/site-state";

export async function GET() {
  const messages = await readMessages();
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const body = await request.json();
  const message = {
    id: newMessageId(),
    name: String(body.name ?? "").trim(),
    company: String(body.company ?? "").trim(),
    email: String(body.email ?? "").trim(),
    phone: String(body.phone ?? "").trim(),
    service: String(body.service ?? "").trim(),
    message: String(body.message ?? "").trim(),
    status: "new" as const,
    createdAt: new Date().toISOString()
  };

  if (!message.name || !message.email || !message.message) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  await appendMessage(message);
  return NextResponse.json(message, { status: 201 });
}
