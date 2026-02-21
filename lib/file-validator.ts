// File upload validation utility
export interface FileValidationResult {
  isValid: boolean
  error?: string
  sanitizedName?: string
}

export class FileValidator {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  private static readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ]
  private static readonly ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/ogg'
  ]
  private static readonly ALLOWED_AUDIO_TYPES = [
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/mpeg'
  ]

  static validateImage(file: File): FileValidationResult {
    return this.validateFile(file, this.ALLOWED_IMAGE_TYPES, 'image')
  }

  static validateVideo(file: File): FileValidationResult {
    return this.validateFile(file, this.ALLOWED_VIDEO_TYPES, 'video')
  }

  static validateAudio(file: File): FileValidationResult {
    return this.validateFile(file, this.ALLOWED_AUDIO_TYPES, 'audio')
  }

  private static validateFile(
    file: File, 
    allowedTypes: string[], 
    fileType: string
  ): FileValidationResult {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size must be less than ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      }
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid ${fileType} format. Allowed: ${allowedTypes.join(', ')}`
      }
    }

    // Sanitize filename
    const sanitizedName = this.sanitizeFileName(file.name)
    
    // Check for suspicious file names
    if (this.isSuspiciousFileName(sanitizedName)) {
      return {
        isValid: false,
        error: 'Invalid file name'
      }
    }

    return {
      isValid: true,
      sanitizedName
    }
  }

  private static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .substring(0, 100) // Limit length
  }

  private static isSuspiciousFileName(fileName: string): boolean {
    const suspiciousPatterns = [
      /\.php$/i,
      /\.js$/i,
      /\.html$/i,
      /\.exe$/i,
      /\.bat$/i,
      /\.sh$/i,
      /script/i,
      /javascript/i
    ]

    return suspiciousPatterns.some(pattern => pattern.test(fileName))
  }
}