import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = `form-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const form = await prisma.form.create({
    data: {
      userId: session.user.id,
      title: "Untitled Form",
      slug,
    },
    include: { fields: true },
  });

  return NextResponse.json(form, { status: 201 });
}
