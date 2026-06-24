import { NextResponse } from "next/server";
import { deleteMessage, updateMessage } from "@/lib/data-store";
import { getAdminFromRequest } from "@/lib/admin-session";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const allowedStatuses = ["new", "read", "replied", "archived"];
  const patch = typeof body.status === "string" && allowedStatuses.includes(body.status)
    ? { status: body.status }
    : {};
  const updated = await updateMessage(id, patch);
  if (!updated) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const removed = await deleteMessage(id);
  if (!removed) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
