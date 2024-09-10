export default function extractFileType(base64String) {
    // The first part of the base64 string is the mime type declaration
    const mimeTypeMatch = base64String.match(/^data:(.*);base64,/);
  
    if (mimeTypeMatch) {
      const mimeType = mimeTypeMatch[1]; // This is the extracted mime type (e.g., "image/png")
      return mimeType;
    }
  
    return null; // Return null if the mime type is not found
  }