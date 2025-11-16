"use client";

import { useMemo, useState } from "react";
import type { SourceItem } from "@/lib/db";

function prettySize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let u = 0;
  while (size >= 1024 && u < units.length - 1) {
    size = size / 1024;
    u++;
  }
  return `${size.toFixed(1)} ${units[u]}`;
}

export function SourcesList({
  sources,
  selectedIds,
  onToggleSelect,
  onDelete,
  onRename
}: {
  sources: SourceItem[];
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onDelete: (ids: number[]) => void | Promise<void>;
  onRename: (id: number, name: string) => void | Promise<void>;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>("");

  const count = sources.length;
  const selectedCount = useMemo(() => sources.filter((s) => selectedIds.has(s.id!)).length, [sources, selectedIds]);

  return (
    <div className="panel pad">
      <div className="meta">
        <h2 className="title" style={{ margin: 0 }}>Your Sources</h2>
        <div className="row">
          <span className="badge">{count} total</span>
          <span className="badge">{selectedCount} selected</span>
          <button
            className="btn danger"
            disabled={selectedCount === 0}
            onClick={() => onDelete(sources.filter((s) => selectedIds.has(s.id!)).map((s) => s.id!))}
          >
            Delete Selected
          </button>
        </div>
      </div>

      <div className="list">
        {sources.map((s) => {
          const url = typeof window !== "undefined" ? URL.createObjectURL(s.data) : "";
          const isImage = s.type.startsWith("image/");
          const isVideo = s.type.startsWith("video/");
          const isPdf = s.type === "application/pdf";

          return (
            <div className="card panel" key={s.id}>
              <div className="preview">
                {isImage && <img src={url} alt={s.name} />}
                {isVideo && (
                  <video src={url} controls preload="metadata" />
                )}
                {!isImage && !isVideo && !isPdf && (
                  <div className="muted">{s.type}</div>
                )}
                {isPdf && (
                  <iframe src={url} title={s.name} style={{ width: "100%", height: 220, border: "none" }} />
                )}
              </div>
              <div className="pad">
                <div className="meta">
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      className="checkbox"
                      type="checkbox"
                      checked={selectedIds.has(s.id!)}
                      onChange={() => onToggleSelect(s.id!)}
                    />
                    {editingId === s.id ? (
                      <input
                        autoFocus
                        className="input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            onRename(s.id!, editName);
                            setEditingId(null);
                          }
                          if (e.key === "Escape") {
                            setEditingId(null);
                          }
                        }}
                      />
                    ) : (
                      <span className="name" title={s.name}>{s.name}</span>
                    )}
                  </div>
                  <div className="small">{prettySize(s.size)}</div>
                </div>
                {editingId !== s.id && (
                  <div className="row" style={{ marginTop: 8 }}>
                    <button className="btn secondary" onClick={() => { setEditingId(s.id!); setEditName(s.name); }}>Rename</button>
                    <a className="btn secondary" download={s.name} href={url}>Download</a>
                    <button className="btn danger" onClick={() => onDelete([s.id!])}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
