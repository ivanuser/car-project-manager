import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id: params.projectId, userId: session.user.id }
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PUT(request: Request, { params }: { params: { projectId: string } }) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description } = await request.json();
  const updatedProject = await prisma.project.update({
    where: { id: params.projectId, userId: session.user.id },
    data: { name, description }
  });

  return NextResponse.json(updatedProject);
}

export async function DELETE(request: Request, { params }: { params: { projectId: string } }) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.project.delete({
    where: { id: params.projectId, userId: session.user.id }
  });

  return NextResponse.json({ message: "Project deleted successfully" });
}