-- 创建图像生成任务表
CREATE TABLE IF NOT EXISTS "imageGenerationTasks" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text NOT NULL,
  "taskId" text NOT NULL UNIQUE,
  "prompt" text NOT NULL,
  "model" text DEFAULT 'doubao-seedance-4-5' NOT NULL,
  "size" text DEFAULT '1:1' NOT NULL,
  "resolution" text DEFAULT '2K' NOT NULL,
  "imageCount" integer DEFAULT 1 NOT NULL,
  "costPoints" integer NOT NULL,
  "status" text DEFAULT 'submitted' NOT NULL,
  "imageUrls" text,
  "errorMessage" text,
  "refunded" boolean DEFAULT false,
  "createdAt" timestamp DEFAULT now(),
  "completedAt" timestamp,
  CONSTRAINT "imageGenerationTasks_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS "imageGenerationTasks_userId_idx" ON "imageGenerationTasks" ("userId");
CREATE INDEX IF NOT EXISTS "imageGenerationTasks_taskId_idx" ON "imageGenerationTasks" ("taskId");
CREATE INDEX IF NOT EXISTS "imageGenerationTasks_status_idx" ON "imageGenerationTasks" ("status");
CREATE INDEX IF NOT EXISTS "imageGenerationTasks_createdAt_idx" ON "imageGenerationTasks" ("createdAt");
