import { NextResponse } from "next/server";
import { appendMessage, readMessages } from "@/lib/data-store";
import { newMessageId } from "@/lib/site-state";
import { getAdminFromRequest } from "@/lib/admin-session";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
  if (message.name.length > 120 || message.email.length > 254 || message.message.length > 5000) {
    return NextResponse.json({ error: "One or more fields are too long." }, { status: 400 });
  }

  await appendMessage(message);
  return NextResponse.json(message, { status: 201 });
}
