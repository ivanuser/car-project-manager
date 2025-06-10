// Needed to handle route collisions
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { slug: string[] } }) {
  // This route handler simply forwards any GET requests to the Next.js page component
  return NextResponse.redirect(new URL(`/dashboard?slug=${params.slug.join('/')}`, request.url));
}
