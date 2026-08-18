import { Download, Upload } from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import { deserializeDocument, serializeDocument } from "../model/serialization";
import { useDocumentDispatch, useDocumentState, useViewDispatch } from "../state/DiagramProvider";

export function DocumentToolbar() {
  const documentState = useDocumentState();
  const dispatchDocument = useDocumentDispatch();
  const dispatchView = useViewDispatch();
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([serializeDocument(documentState)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gridiro-diagram.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const document = deserializeDocument(await file.text());
      dispatchDocument({ type: "replaceDocument", document });
      dispatchView({ type: "setEditing", editing: null });
      dispatchView({ type: "closeMenu" });
    } catch {
      window.alert("This file is not a valid Gridiro diagram.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="toolbar toolbar-document" onClick={(event) => event.stopPropagation()}>
      <button type="button" onClick={handleExport} aria-label="Export diagram" title="Export diagram">
        <Download size={16} strokeWidth={2.2} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => importInputRef.current?.click()}
        aria-label="Import diagram"
        title="Import diagram"
      >
        <Upload size={16} strokeWidth={2.2} aria-hidden="true" />
      </button>
      <input ref={importInputRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
    </div>
  );
}
