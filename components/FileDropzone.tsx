"use client";

import { useCallback, useState } from "react";

const ACCEPTED = [
  "image/*",
  "video/*",
  "application/pdf",
  "text/plain"
];

export function FileDropzone({ onFiles }: { onFiles: (files: File[]) => void }) {
  const [hover, setHover] = useState(false);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setHover(false);
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length) onFiles(files);
    },
    [onFiles]
  );

  function onPick(ev: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(ev.target.files || []);
    if (files.length) onFiles(files);
    ev.currentTarget.value = "";
  }

  return (
    <div className="panel pad">
      <h2 className="title">Add Sources</h2>
      <div
        className={`drop ${hover ? "hover" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={onDrop}
      >
        Drag and drop videos, images, PDFs, or text files here
      </div>
      <div style={{ height: 10 }} />
      <div className="row">
        <input
          aria-label="Pick files"
          className="input"
          type="file"
          multiple
          accept={ACCEPTED.join(",")}
          onChange={onPick}
        />
        <span className="muted">Accepted: images, videos, PDFs, .txt</span>
      </div>
    </div>
  );
}
