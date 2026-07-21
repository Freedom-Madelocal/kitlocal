import { useState } from "react";
import { UploadCloud, ScanLine, Loader2, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReceiptDropzone({ onScan }: { onScan: (filename: string) => void }) {
  const [drag, setDrag] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);

  const handle = (name: string) => {
    setFilename(name);
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      onScan(name);
    }, 1100);
  };

  const onFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    handle(files[0].name);
  };

  return (
    <section className="neu-card p-5 md:p-6 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="neu-card-sm h-10 w-10 grid place-items-center shrink-0">
          <ScanLine className="h-4 w-4 text-accent" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold">Receipt Scanner</h2>
          <p className="text-xs text-muted-foreground">Drag & drop a receipt image or PDF.</p>
        </div>
      </div>

      <label
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
          "neu-inset p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[220px]",
          drag && "ring-2 ring-primary/60",
        )}
      >
        <input
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => onFile(e.target.files)}
        />
        {scanning ? (
          <>
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
            <div className="font-semibold text-sm">Scanning receipt…</div>
            <div className="text-xs text-muted-foreground mt-1">Extracting line items with OCR</div>
          </>
        ) : filename ? (
          <>
            <FileCheck className="h-8 w-8 text-primary mb-3" />
            <div className="font-semibold text-sm truncate max-w-full">{filename}</div>
            <div className="text-xs text-muted-foreground mt-1">Line items ready — allocate on the right</div>
            <button className="neu-pressable mt-4 px-4 py-2 text-xs font-medium">Upload another</button>
          </>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-primary mb-3" />
            <div className="font-semibold text-sm">Drop your receipt here</div>
            <div className="text-xs text-muted-foreground mt-1">or click to browse</div>
            <div className="text-[10px] text-muted-foreground mt-3">PNG, JPG, or PDF · up to 10MB</div>
          </>
        )}
      </label>
    </section>
  );
}
