/**
 * Helper seguro para descargar archivos sin errores de removeChild
 * Usa link.remove() en lugar de removeChild para evitar NotFoundError
 */
export function safeDownload(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";

  try {
    // Agregar al DOM
    document.body.appendChild(link);

    // Disparar descarga
    link.click();

    // Cleanup en microtask para evitar race conditions
    queueMicrotask(() => {
      try {
        link.remove(); // Usar remove() en lugar de removeChild
      } catch (e) {
        console.debug("Link ya fue removido:", e);
      }
    });
  } catch (error) {
    console.error("Error en descarga:", error);
    // Fallback: intentar sin appendChild
    try {
      link.click();
    } catch (e) {
      console.error("Fallback descarga falló:", e);
    }
  }
}

/**
 * Alternativa: descargar usando fetch + blob (para URLs CORS)
 * Útil para archivos que requieren autenticación o están en otro dominio
 */
export async function downloadBlob(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.rel = "noopener";
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    queueMicrotask(() => {
      try {
        link.remove();
        URL.revokeObjectURL(blobUrl);
      } catch (e) {
        console.debug("Cleanup error:", e);
      }
    });
  } catch (error) {
    console.error("Error downloading blob:", error);
  }
}
