export interface StoredFile {
  key: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface StorageProvider {
  upload(
    buffer: Buffer,
    options: { mimeType: string; prefix?: string; filename?: string },
  ): Promise<StoredFile>;
  getUrl(key: string): Promise<string | null>;
}
