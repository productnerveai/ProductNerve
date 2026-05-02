import { useState, useRef } from "react";
// import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface PhaseFileUploadProps {
  projectId: string;
  phase: "phase1" | "phase2" | "phase3";
  onComplete: () => void;
  onSkip: () => void;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15MB

interface SelectedFile {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
}

export default function PhaseFileUpload({ projectId, phase, onComplete, onSkip }: PhaseFileUploadProps) {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid: SelectedFile[] = [];

    for (const file of selected) {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(ext)) {
        toast.error(`${file.name}: Only PDF, DOC, DOCX files are allowed.`);
        continue;
      }
      valid.push({ file, status: "pending" });
    }

    const newFiles = [...files, ...valid];
    const newTotal = newFiles.reduce((sum, f) => sum + f.file.size, 0);
    if (newTotal > MAX_TOTAL_SIZE) {
      toast.error("Total file size exceeds 15MB limit.");
      return;
    }

    setFiles(newFiles);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      onSkip();
      return;
    }

    setUploading(true);
    let allSuccess = true;

    for (let i = 0; i < files.length; i++) {
      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: "uploading" } : f))
      );

      const file = files[i].file;
      const path = `${projectId}/${phase}/${Date.now()}-${file.name}`;

      // const { error } = await supabase.storage
        // .from("kyc-documents")
        // .upload(path, file, { contentType: file.type, upsert: false });

      // if (error) {
      //   console.error(`Upload error for ${file.name}:`, error);
      //   setFiles((prev) =>
      //     prev.map((f, idx) => (idx === i ? { ...f, status: "error" } : f))
      //   );
      //   toast.error(`Failed to upload ${file.name}: ${error.message}`);
      //   allSuccess = false;
      // } else {
      //   setFiles((prev) =>
      //     prev.map((f, idx) => (idx === i ? { ...f, status: "done" } : f))
      //   );
      // }
    }

    setUploading(false);

    if (allSuccess) {
      toast.success("Files uploaded successfully!");
    }
    onComplete();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="max-w-lg mx-auto py-8 space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <Upload className="h-7 w-7 text-accent" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Upload Additional Materials</h3>
        <p className="text-sm text-muted-foreground">
          Upload supporting documents for deeper AI analysis (optional).
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Accepted: PDF, DOC, DOCX • Max total: 15MB
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.file.name}</p>
                <p className="text-[10px] text-muted-foreground">{formatSize(f.file.size)}</p>
              </div>
              {f.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
              {f.status === "done" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              {f.status === "pending" && (
                <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground text-right">
            Total: {formatSize(totalSize)} / 15MB
          </p>
        </div>
      )}

      {/* Upload input */}
      <div className="flex flex-col items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={handleSelect}
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {files.length > 0 ? "Add More Files" : "Select Files"}
        </Button>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Button variant="ghost" onClick={onSkip} disabled={uploading}>
          Skip
        </Button>
        <Button variant="hero" onClick={uploadFiles} disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Uploading...
            </>
          ) : files.length > 0 ? (
            `Upload & Continue`
          ) : (
            "Continue Without Upload"
          )}
        </Button>
      </div>
    </div>
  );
}