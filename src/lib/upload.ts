import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

export const ourFileRouter = {
  serviceImage: f({ image: { maxFileSize: '4MB', maxFileCount: 5 } })
    .middleware(async () => {
      // L'authentification est gérée côté client via le token JWT
      // uploadthing ne supporte pas directement les headers custom dans le middleware
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
