import { NextResponse } from "next/server";
import { deleteMessage, updateMessage } from "@/lib/data-store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const updated = await updateMessage(id, body);
  if (!updated) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = await deleteMessage(id);
  if (!removed) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
