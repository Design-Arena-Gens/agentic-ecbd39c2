"use client";

import { useEffect, useMemo, useState } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { SourcesList } from "@/components/SourcesList";
import { AssistantConnector } from "@/components/AssistantConnector";
import { db, type SourceItem } from "@/lib/db";

export default function HomePage() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    void db.sources.toArray().then(setSources);
  }, []);

  async function handleFiles(files: File[]) {
    const items: SourceItem[] = [];
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: file.type || "application/octet-stream" });
      const item: Omit<SourceItem, "id"> = {
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        createdAt: new Date().toISOString(),
        data: blob
      };
      const id = await db.sources.add(item as any);
      const saved = await db.sources.get(id);
      if (saved) items.push(saved);
    }
    setSources((prev) => [...items, ...prev]);
  }

  async function handleDelete(ids: number[]) {
    await db.sources.bulkDelete(ids);
    setSources(await db.sources.toArray());
    setSelectedIds(new Set());
  }

  async function handleRename(id: number, name: string) {
    await db.sources.update(id, { name });
    setSources(await db.sources.toArray());
  }

  const selected = useMemo(() => sources.filter((s) => selectedIds.has(s.id!)), [sources, selectedIds]);

  return (
    <div className="stack">
      <FileDropzone onFiles={handleFiles} />
      <SourcesList
        sources={sources}
        selectedIds={selectedIds}
        onToggleSelect={(id) => {
          setSelectedIds((prev) => {
            const copy = new Set(prev);
            if (copy.has(id)) copy.delete(id);
            else copy.add(id);
            return copy;
          });
        }}
        onDelete={handleDelete}
        onRename={handleRename}
      />
      <AssistantConnector selected={selected} />
    </div>
  );
}
