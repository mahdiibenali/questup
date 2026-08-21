import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { generateSignedUploadUrl } from "@/lib/cloudinary";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const uploadData = generateSignedUploadUrl(userId);

  return NextResponse.json(uploadData);
}
