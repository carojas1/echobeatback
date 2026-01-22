-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "mood" TEXT,
ADD COLUMN     "ownerEmail" TEXT,
ADD COLUMN     "ownerUid" TEXT;

-- CreateIndex
CREATE INDEX "Song_ownerUid_idx" ON "Song"("ownerUid");
