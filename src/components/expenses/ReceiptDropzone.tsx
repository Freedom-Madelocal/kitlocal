import { useRef, useState } from "react";
import { FileUp, Camera, FileText, Loader2, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReceiptDropzone({ onScan }: { onScan: (filename: string) => void }) {
  const [drag, setDrag] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cameraRef = useRef<HTMLInputElement | null>(null);

  const handle = (name: string) => {
    setFilename(name);
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      onScan(name);
    }, 900);
  };

  const onFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    handle(files[0].name);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        onFile(e.dataTransfer.files);
      }}
      className={cn(
        "neu-inset p-5 md:p-7 rounded-2xl transition-all",
        drag && "ring-2 ring-primary/50",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => onFile(e.target.files)}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onFile(e.target.files)}
      />

      <div className="flex items-center gap-4 md:gap-6 flex-wrap md:flex-nowrap">
        <div className="neu-card-sm h-16 w-16 md:h-20 md:w-20 grid place-items-center shrink-0">
          {scanning ? (
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          ) : filename ? (
            <FileCheck className="h-8 w-8 text-primary" />
          ) : (
            <FileText className="h-8 w-8 text-primary" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-lg md:text-xl font-semibold">
            {scanning
              ? "Scanning receipt…"
              : filename
                ? filename
                : "Upload a receipt."}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {scanning
              ? "Extracting line items with OCR"
              : filename
                ? "Line items ready — review below"
                : "PNG, JPG, or PDF · up to 10 MB"}
          </p>
        </div>
        <div className="flex gap-2 md:gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => inputRef.current?.click()}
            className="neu-pressable bg-primary text-primary-foreground hover:bg-primary/90 px-4 md:px-5 py-2.5 md:py-3 text-sm font-semibold rounded-xl flex items-center gap-2 flex-1 md:flex-none justify-center"
          >
            <FileUp className="h-4 w-4" /> Upload receipt
          </button>
          <button
            onClick={() => cameraRef.current?.click()}
            className="neu-pressable px-4 md:px-5 py-2.5 md:py-3 text-sm font-semibold text-primary rounded-xl flex items-center gap-2 flex-1 md:flex-none justify-center"
          >
            <Camera className="h-4 w-4" /> Take a photo
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground mt-4 border-t border-border/50 pt-3">
        You can also drag a file here.
      </div>
    </div>
  );
}
