import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const marketplaceItems = await prisma.marketplaceItem.findMany();
  return NextResponse.json(marketplaceItems);
}

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, price } = await request.json();
  const marketplaceItem = await prisma.marketplaceItem.create({
    data: {
      name,
      description,
      price,
      sellerId: session.user.id
    }
  });

  return NextResponse.json(marketplaceItem, { status: 201 });
}