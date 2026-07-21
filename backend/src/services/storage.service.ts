import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export class StorageService {
  private static supabase: SupabaseClient | null = null;
  private static bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'media';
  private static uploadDir = path.join(process.cwd(), 'uploads');

  /**
   * Initializes Supabase Client if environment variables are provided.
   */
  private static getClient(): SupabaseClient | null {
    if (this.supabase) return this.supabase;

    const supabaseUrl = process.env.SUPABASE_URL || 'https://espfrijljdzvzfoeuieg.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      return this.supabase;
    }
    return null;
  }

  /**
   * Uploads an optimized buffer to storage.
   * Prefers Supabase Storage bucket; falls back to local uploads directory if credentials are missing.
   *
   * @param buffer - WebP buffer
   * @param filename - Unique WebP filename
   * @param mimetype - WebP mimetype ('image/webp')
   * @returns Public relative path or filename
   */
  static async uploadFile(buffer: Buffer, filename: string, mimetype: string = 'image/webp'): Promise<string> {
    const supabase = this.getClient();

    if (supabase) {
      try {
        const { data, error } = await supabase.storage
          .from(this.bucketName)
          .upload(filename, buffer, {
            contentType: mimetype,
            upsert: true,
            cacheControl: '31536000', // 1 year cache
          });

        if (!error && data) {
          return filename;
        }
        console.warn('[StorageService] Supabase upload failed/fallback to local:', error?.message);
      } catch (err) {
        console.warn('[StorageService] Supabase client error:', err);
      }
    }

    // Fallback: Store in local uploads directory
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    const filePath = path.join(this.uploadDir, filename);
    await fs.promises.writeFile(filePath, buffer);
    return filename;
  }

  /**
   * Deletes a file from Supabase Storage and local disk.
   *
   * @param filename - Name of file to delete
   */
  static async deleteFile(filename: string): Promise<void> {
    const supabase = this.getClient();

    if (supabase) {
      try {
        await supabase.storage.from(this.bucketName).remove([filename]);
      } catch (err) {
        console.warn('[StorageService] Supabase delete warning:', err);
      }
    }

    // Also remove local file if present
    const localPath = path.join(this.uploadDir, filename);
    if (fs.existsSync(localPath)) {
      try {
        await fs.promises.unlink(localPath);
      } catch (err) {
        // Ignore unlink error
      }
    }
  }
}
