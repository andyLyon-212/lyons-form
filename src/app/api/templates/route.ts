import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templates = await prisma.form.findMany({
    where: { isTemplate: true },
    include: {
      _count: { select: { fields: true } },
    },
    orderBy: { title: "asc" },
  });

  return NextResponse.json(templates);
}
