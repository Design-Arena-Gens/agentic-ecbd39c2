"use client";

import { useMemo, useState } from "react";
import type { SourceItem } from "@/lib/db";

async function fileToTextOrBase64(blob: Blob): Promise<{ base64: string; text?: string }> {
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  let text: string | undefined;
  if (blob.type.startsWith("text/") || blob.type === "application/json") {
    text = await blob.text();
  }
  return { base64, text };
}

export function AssistantConnector({ selected }: { selected: SourceItem[] }) {
  const [endpoint, setEndpoint] = useState<string>("");
  const [method, setMethod] = useState<"multipart" | "json">("multipart");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string>("");

  const disabled = useMemo(() => !endpoint || selected.length === 0 || sending, [endpoint, selected.length, sending]);

  async function send() {
    setSending(true);
    setResult("");
    try {
      let res: Response;
      if (method === "multipart") {
        const form = new FormData();
        selected.forEach((s, idx) => {
          form.append("files", s.data, s.name);
          form.append(`meta_${idx}`, JSON.stringify({ id: s.id, name: s.name, type: s.type, size: s.size, createdAt: s.createdAt }));
        });
        res = await fetch(endpoint, { method: "POST", body: form });
      } else {
        const payload = await Promise.all(
          selected.map(async (s) => {
            const { base64, text } = await fileToTextOrBase64(s.data);
            return {
              id: s.id,
              name: s.name,
              type: s.type,
              size: s.size,
              createdAt: s.createdAt,
              data: base64,
              encoding: "base64",
              text
            };
          })
        );
        res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sources: payload })
        });
      }
      const text = await res.text();
      setResult(`${res.status} ${res.statusText}\n\n${text}`);
    } catch (err: any) {
      setResult(`ERROR: ${err?.message || String(err)}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="panel pad">
      <h2 className="title">Assistant Connector</h2>
      <div className="row">
        <input
          className="input"
          placeholder="https://your-assistant-node.example.com/ingest"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          style={{ minWidth: 420 }}
        />
        <select className="select" value={method} onChange={(e) => setMethod(e.target.value as any)}>
          <option value="multipart">multipart/form-data</option>
          <option value="json">JSON (base64)</option>
        </select>
        <button className="btn" disabled={disabled} onClick={send}>
          {sending ? "Sending..." : `Send ${selected.length} file(s)`}
        </button>
      </div>
      <p className="muted">This posts your selected sources to the endpoint. Choose multipart for large binaries.</p>
      {result && (
        <div className="panel pad" style={{ marginTop: 12 }}>
          <div className="title">Response</div>
          <pre className="textarea" style={{ whiteSpace: "pre-wrap" }}>{result}</pre>
        </div>
      )}
    </div>
  );
}
