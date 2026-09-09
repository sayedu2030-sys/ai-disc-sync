import { toPng } from 'html-to-image';

export async function exportElementAsPng(
  element: HTMLElement,
  fileNamePrefix = 'DISC_진단결과'
): Promise<void> {
  try {
    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 2, // 2x crisp retina resolution
      backgroundColor: '#ffffff',
      skipFonts: true, // Prevents external webfont loading failures that cause icon ligatures to break into raw text
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList.contains('no-export')) {
          return false;
        }
        return true;
      }
    });

    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const filename = `${fileNamePrefix}_${dateStr}.png`;

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('[ImageExport] Error generating PNG:', error);
    throw new Error('이미지 파일 생성 중 오류가 발생했습니다.');
  }
}
