import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;

  const form = await prisma.form.findFirst({
    where: { id: formId, status: "published" },
  });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const body = await request.json();
  const { data } = body;

  if (!data || typeof data !== "object") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const submission = await prisma.formSubmission.create({
    data: {
      formId,
      data,
    },
  });

  return NextResponse.json({ id: submission.id }, { status: 201 });
}
