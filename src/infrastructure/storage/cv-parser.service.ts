import { Injectable } from '@nestjs/common';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class CvParserService {
  async parse(
    buffer: Buffer, // nd CV dạng binary
    extension: 'pdf' | 'docx' | 'doc',
  ): Promise<string> {
    if (extension === 'pdf') {
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      try {
        const parsed = await parser.getText();
        return this.normalize(parsed.text);
      } finally {
        await parser.destroy();
      }
    }

    if (extension === 'doc') {
      throw new Error('Legacy .doc CV parsing is not supported yet');
    }

    const parsed = await mammoth.extractRawText({ buffer });
    return this.normalize(parsed.value);
  }

  summarize(rawText: string, maxLength = 2000): string {
    return this.normalize(rawText).slice(0, maxLength);
  }

  private normalize(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
  }
}
