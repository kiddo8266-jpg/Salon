import { UTApi } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const utapi = new UTApi();

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;

    const media = await prisma.media.findUnique({
      where: { id }
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    if (media.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 1. Delete from UploadThing
    try {
      await utapi.deleteFiles(media.key);
    } catch (utError) {
      console.warn("Could not delete from cloud (might already be gone):", utError);
    }

    // 2. Delete from Database
    await prisma.media.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("DELETE Media Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const body = await req.json();
    const { isCover } = body;

    const media = await prisma.media.findUnique({
      where: { id }
    });

    if (!media || media.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    if (isCover) {
      // Use transaction to set as cover and unset others
      await prisma.$transaction([
        prisma.media.updateMany({
          where: { tenantId: session.user.tenantId, isCover: true },
          data: { isCover: false }
        }),
        prisma.media.update({
          where: { id },
          data: { isCover: true }
        }),
        prisma.tenant.update({
          where: { id: session.user.tenantId },
          data: { coverImageUrl: media.url }
        })
      ]);
    }

    return NextResponse.json({ message: "Media updated successfully" });
  } catch (error) {
    console.error("PATCH Media Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
