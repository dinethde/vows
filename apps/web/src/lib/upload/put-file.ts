export type ProgressListener = (percent: number) => void;

const FULL = 100;

/**
 * Sends one file straight to object storage, at the signed address the API
 * handed out. This is the only request in the web app that does not go through
 * `@/lib/api`, because it does not go to the API: the bytes never pass through
 * our server. It uses XMLHttpRequest rather than fetch because only that
 * reports how much of the upload has left the browser, and the number in the
 * slot has to be the real one.
 */
export function putFile(url: string, file: File, onProgress: ProgressListener): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url);
    // The address was signed for this type; a different one is refused.
    request.setRequestHeader("content-type", file.type);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * FULL));
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress(FULL);
        resolve();
      } else {
        reject(new Error(`Storage answered ${String(request.status)}.`));
      }
    };
    request.onerror = () => {
      reject(new Error("The connection dropped during the upload."));
    };
    request.onabort = () => {
      reject(new Error("The upload was stopped."));
    };
    request.send(file);
  });
}
