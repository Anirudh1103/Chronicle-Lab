-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "coverImage" TEXT,
    "coverImageAlt" TEXT,
    "coverImageCaption" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "reactionHistoric" INTEGER NOT NULL DEFAULT 0,
    "reactionBrilliant" INTEGER NOT NULL DEFAULT 0,
    "reactionInsightful" INTEGER NOT NULL DEFAULT 0,
    "readingTime" INTEGER NOT NULL DEFAULT 0,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "canonicalUrl" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "twitterImage" TEXT,
    "schemaType" TEXT NOT NULL DEFAULT 'Article',
    "robotsIndex" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" DATETIME,
    "scheduledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("authorId", "canonicalUrl", "categoryId", "coverImage", "coverImageAlt", "coverImageCaption", "createdAt", "excerpt", "featured", "id", "likes", "ogDescription", "ogImage", "ogTitle", "publishedAt", "readingTime", "robotsIndex", "scheduledAt", "schemaType", "seoDescription", "seoKeywords", "seoTitle", "slug", "status", "subtitle", "title", "twitterImage", "updatedAt", "views", "wordCount") SELECT "authorId", "canonicalUrl", "categoryId", "coverImage", "coverImageAlt", "coverImageCaption", "createdAt", "excerpt", "featured", "id", "likes", "ogDescription", "ogImage", "ogTitle", "publishedAt", "readingTime", "robotsIndex", "scheduledAt", "schemaType", "seoDescription", "seoKeywords", "seoTitle", "slug", "status", "subtitle", "title", "twitterImage", "updatedAt", "views", "wordCount" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
CREATE INDEX "Post_slug_idx" ON "Post"("slug");
CREATE INDEX "Post_status_idx" ON "Post"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
