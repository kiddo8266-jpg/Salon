import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma"

const f = createUploadthing();

export const ourFileRouter = {
  galleryImage: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new Error("Unauthorized");
      return { tenantId: session.user.tenantId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for tenant:", metadata.tenantId);
      
      try {
        await prisma.media.create({
          data: {
            tenantId: metadata.tenantId,
            url: file.url,
            key: file.key,
            filename: file.name,
            mimeType: file.type,
            fileSize: file.size,
          }
        });
      } catch (error) {
        console.error("Failed to save media metadata:", error);
      }
      
      return { uploadedBy: metadata.tenantId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
