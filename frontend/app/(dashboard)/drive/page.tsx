"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchDrive,
  createFolder,
  uploadFile,
  deleteFile,
  deleteFolder,
  downloadFileUrl,
  DriveListing,
} from "@/lib/api";
import { Folder, FileText, Upload, Plus, Trash2, Download, ChevronLeft } from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 بايت";
  const units = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export default function DrivePage() {
  const [listing, setListing] = useState<DriveListing | null>(null);
  const [folderStack, setFolderStack] = useState<{ id: string; name: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFolderId = folderStack[folderStack.length - 1]?.id;

  const load = useCallback(() => {
    fetchDrive(currentFolderId).then(setListing).catch(() => setError("تعذر تحميل الملفات."));
  }, [currentFolderId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreateFolder() {
    const name = window.prompt("اسم المجلد الجديد:");
    if (!name) return;
    await createFolder(name, currentFolderId);
    load();
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadFile(file, currentFolderId);
      }
      load();
    } catch {
      setError("فشل رفع الملف.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDeleteFile(id: string) {
    if (!window.confirm("هل تريد حذف هذا الملف؟")) return;
    await deleteFile(id);
    load();
  }

  async function handleDeleteFolder(id: string) {
    if (!window.confirm("هل تريد حذف هذا المجلد؟")) return;
    await deleteFolder(id);
    load();
  }

  return (
    <div
      className="space-y-6"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleUpload(e.dataTransfer.files);
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-eh-text">ملفات الشركة</h1>
          {/* Breadcrumb */}
          <div className="mt-1 flex items-center gap-1 text-sm text-eh-text-muted">
            <button onClick={() => setFolderStack([])} className="hover:text-eh-gold">
              الرئيسية
            </button>
            {folderStack.map((f, idx) => (
              <span key={f.id} className="flex items-center gap-1">
                <ChevronLeft className="h-3.5 w-3.5" />
                <button
                  onClick={() => setFolderStack(folderStack.slice(0, idx + 1))}
                  className="hover:text-eh-gold"
                >
                  {f.name}
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCreateFolder}
            className="flex items-center gap-2 rounded-lg border border-eh-border bg-eh-bg-elevated/50 px-3.5 py-2 text-sm text-eh-text-muted transition hover:border-eh-gold/40 hover:text-eh-gold"
          >
            <Plus className="h-4 w-4" /> مجلد جديد
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 rounded-lg bg-eh-gold px-3.5 py-2 text-sm font-medium text-eh-bg transition hover:brightness-110 disabled:opacity-60"
          >
            <Upload className="h-4 w-4" /> {isUploading ? "جارٍ الرفع..." : "رفع ملف"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>
      </div>

      {error && <div className="eh-glass rounded-xl border-eh-red/30 p-4 text-sm text-eh-red">{error}</div>}

      <div className="eh-glass rounded-2xl p-2">
        {listing && listing.folders.length === 0 && listing.files.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-eh-text-faint">
            <Folder className="h-10 w-10" strokeWidth={1.3} />
            <p className="text-sm">هذا المجلد فارغ — اسحب ملفًا هنا أو استخدم زر الرفع</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2 lg:grid-cols-3">
          {listing?.folders.map((folder) => (
            <div
              key={folder.id}
              className="group flex items-center justify-between rounded-xl border border-eh-border bg-eh-bg-elevated/40 px-4 py-3 transition hover:border-eh-gold/30"
            >
              <button
                onClick={() => setFolderStack([...folderStack, { id: folder.id, name: folder.name }])}
                className="flex flex-1 items-center gap-3 text-right"
              >
                <Folder className="h-5 w-5 shrink-0 text-eh-gold" strokeWidth={1.8} />
                <span className="truncate text-sm text-eh-text">{folder.name}</span>
              </button>
              <button
                onClick={() => handleDeleteFolder(folder.id)}
                className="opacity-0 transition group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4 text-eh-text-faint hover:text-eh-red" />
              </button>
            </div>
          ))}

          {listing?.files.map((file) => (
            <div
              key={file.id}
              className="group flex items-center justify-between rounded-xl border border-eh-border bg-eh-bg-elevated/40 px-4 py-3 transition hover:border-eh-teal/30"
            >
              <div className="flex flex-1 items-center gap-3 overflow-hidden">
                <FileText className="h-5 w-5 shrink-0 text-eh-teal" strokeWidth={1.8} />
                <div className="truncate">
                  <p className="truncate text-sm text-eh-text">{file.name}</p>
                  <p className="text-xs text-eh-text-faint">{formatBytes(file.size_bytes)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                <a href={downloadFileUrl(file.id)} target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4 text-eh-text-faint hover:text-eh-teal" />
                </a>
                <button onClick={() => handleDeleteFile(file.id)}>
                  <Trash2 className="h-4 w-4 text-eh-text-faint hover:text-eh-red" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
