import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Initialize PDF.js worker
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface ParsedResume {
  text: string;
  fileType: string;
  rawFileData: string;
}

export async function parseResume(file: File): Promise<ParsedResume> {
  try {
    const fileType = file.name.split('.').pop()?.toLowerCase() || '';
    const rawFileData = await readFileAsBase64(file);
    let text = '';

    switch (fileType) {
      case 'pdf':
        text = await parsePDF(rawFileData);
        break;
      case 'docx':
        text = await parseDocx(rawFileData);
        break;
      case 'txt':
        text = await parseTxt(rawFileData);
        break;
      default:
        throw new Error('Unsupported file type');
    }

    return {
      text,
      fileType,
      rawFileData
    };
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
}

async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function parsePDF(base64Data: string): Promise<string> {
  try {
    // Remove the data URL prefix
    const pdfData = base64Data.replace(/^data:application\/pdf;base64,/, '');
    const uint8Array = new Uint8Array(atob(pdfData).split('').map(char => char.charCodeAt(0)));
    
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ') + '\n';
    }
    
    return text.trim();
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
}

async function parseDocx(base64Data: string): Promise<string> {
  try {
    // Remove the data URL prefix
    const docxData = base64Data.replace(/^data:application\/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,/, '');
    const uint8Array = new Uint8Array(atob(docxData).split('').map(char => char.charCodeAt(0)));
    
    const result = await mammoth.extractRawText({ arrayBuffer: uint8Array.buffer });
    return result.value.trim();
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse DOCX file');
  }
}

async function parseTxt(base64Data: string): Promise<string> {
  try {
    // Remove the data URL prefix
    const txtData = base64Data.replace(/^data:text\/plain;base64,/, '');
    return atob(txtData).trim();
  } catch (error) {
    console.error('Error parsing TXT:', error);
    throw new Error('Failed to parse TXT file');
  }
} 