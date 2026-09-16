import { useEffect, useRef, useState } from 'react';
import { downloadFile } from '../services/download';

export function useWorkbookDownload(scope: string) {
  const current = useRef<AbortController | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    setDownloading(false);
    setDownloadError(null);
    return () => {
      current.current?.abort();
      current.current = null;
    };
  }, [scope]);

  const startDownload = async (load: (signal: AbortSignal) => Promise<Blob>, filename: string) => {
    if (current.current) return;
    const controller = new AbortController();
    current.current = controller;
    setDownloading(true);
    setDownloadError(null);
    try {
      const workbook = await load(controller.signal);
      if (!controller.signal.aborted) downloadFile(workbook, filename);
    } catch (error) {
      if (!controller.signal.aborted)
        setDownloadError(error instanceof Error ? error.message : 'Unable to download workbook.');
    } finally {
      if (current.current === controller) {
        current.current = null;
        setDownloading(false);
      }
    }
  };

  return {
    downloading,
    downloadError,
    clearDownloadError: () => setDownloadError(null),
    startDownload,
  };
}
