/**
 * Client-Side Image Upload Service
 */
export class UploadService {
  /**
   * Returns the file directly without client-side canvas compression
   * to preserve 100% original fidelity and avoid double-processing.
   */
  static async convertToWebP(file: File): Promise<Blob> {
    return file;
  }
}
