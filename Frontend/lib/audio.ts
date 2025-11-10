/**
 * Utility functions for audio playback
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5075";

/**
 * Loại bỏ BOM (Byte Order Mark) và các ký tự không hợp lệ khỏi text
 * @param text Text cần clean
 * @returns Text đã được clean
 */
function cleanText(text: string): string {
  if (!text) return "";
  
  // Loại bỏ BOM (UTF-8 BOM: \uFEFF hoặc \xEF\xBB\xBF)
  let cleaned = text.replace(/^\uFEFF/, "").replace(/^\xEF\xBB\xBF/, "");
  
  // Loại bỏ các ký tự whitespace ở đầu và cuối
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Tạo proxy audio URL từ backend để tránh lỗi CORS
 * @param text Text cần phát âm (chữ Hán)
 * @param lang Ngôn ngữ (mặc định: zh-CN)
 * @returns Proxy audio URL
 */
export function getProxyAudioUrl(text: string, lang: string = "zh-CN"): string {
  if (!text) return "";
  
  // Clean text trước khi xử lý
  const cleanedText = cleanText(text);
  if (!cleanedText) return "";
  
  // Nếu đã là proxy URL hoặc URL hợp lệ khác, trả về nguyên
  if (cleanedText.startsWith("http://") || cleanedText.startsWith("https://")) {
    // Kiểm tra xem có phải Google TTS URL không
    if (cleanedText.includes("translate.google.com/translate_tts")) {
      // Extract text từ Google TTS URL và tạo proxy URL
      try {
        const url = new URL(cleanedText);
        const q = url.searchParams.get("q");
        if (q) {
          // Clean text từ URL parameter
          const cleanedQ = cleanText(q);
          if (cleanedQ) {
            return `${API_BASE_URL}/api/audio/proxy?text=${encodeURIComponent(cleanedQ)}&lang=${lang}`;
          }
        }
      } catch (e) {
        // Nếu không parse được, tạo proxy URL từ text gốc
      }
    } else {
      // Nếu là URL khác (không phải Google TTS), trả về nguyên
      return cleanedText;
    }
  }
  
  // Tạo proxy URL từ text đã clean
  return `${API_BASE_URL}/api/audio/proxy?text=${encodeURIComponent(cleanedText)}&lang=${lang}`;
}

/**
 * Phát audio với proxy URL
 * @param text Text cần phát âm
 * @param lang Ngôn ngữ
 * @returns Promise<HTMLAudioElement>
 */
export async function playAudio(text: string, lang: string = "zh-CN"): Promise<void> {
  if (!text) return;
  
  const audioUrl = getProxyAudioUrl(text, lang);
  const audio = new Audio(audioUrl);
  
  try {
    await audio.play();
  } catch (error) {
    console.error("Lỗi khi phát audio:", error);
    throw error;
  }
}

