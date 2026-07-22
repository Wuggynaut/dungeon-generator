type ExportPanelProps = { text: string; filename: string };

// Shared export control: shows the serialized file with copy and download.
export function ExportPanel({ text, filename }: ExportPanelProps) {
    const copy = () => navigator.clipboard?.writeText(text);
    const download = () => {
        const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };
    return (
        <details style={{ marginTop: "0.75rem" }}>
            <summary>Export {filename}</summary>
            <div style={{ display: "flex", gap: "0.5rem", margin: "0.5rem 0" }}>
                <button type="button" onClick={copy}>Copy</button>
                <button type="button" onClick={download}>Download</button>
            </div>
            <textarea readOnly value={text} rows={12}
                      style={{ width: "100%", fontFamily: "monospace", fontSize: "0.8em" }} />
        </details>
    );
}