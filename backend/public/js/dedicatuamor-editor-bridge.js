(function () {
    console.log("[DEDICATUAMOR] Editor Bridge cargado");

    let permissions = null;
    let savedDataApplied = false;

    function normalizeText(value) {
        return String(value || "")
            .trim()
            .toLowerCase();
    }

    function isAdmin() {
        return (
            permissions?.source === "admin" ||
            permissions?.level === "admin" ||
            permissions?.role === "admin" ||
            permissions?.can_download_html === true
        );
    }

    function hideInternalButtons() {
        if (isAdmin()) return;

        document.querySelectorAll("button, a").forEach((element) => {
            const text = normalizeText(element.textContent);

            if (
                text.includes("guardar") ||
                text.includes("descargar") ||
                text.includes("html final") ||
                text.includes("resetear") ||
                text.includes("exportar")
            ) {
                element.style.display = "none";
            }
        });
    }

    function makePlaceholders() {
        if (savedDataApplied) return;

        document.querySelectorAll("input, textarea").forEach((field) => {
            field.value = "";
            field.dataset.originalPlaceholderDone = "1";
        });
    }

    function collectFormData() {
        const data = {};

        document
            .querySelectorAll("input, textarea, select")
            .forEach((field) => {
                const key =
                    field.id ||
                    field.name ||
                    `field_${Math.random().toString(36).substring(2, 8)}`;

                if (field.type === "file") {
                    return;
                }

                data[key] = field.value;
            });

        return data;
    }

    function applySavedData(data) {
        if (!data || typeof data !== "object") return;

        Object.entries(data).forEach(([key, value]) => {
            const field =
                document.getElementById(key) ||
                document.querySelector(`[name="${key}"]`);

            if (!field) return;

            if (field.type === "file") {
                return;
            }

            if ("value" in field) {
                field.value = value ?? "";

                field.dispatchEvent(new Event("input", { bubbles: true }));
                field.dispatchEvent(new Event("change", { bubbles: true }));
            }
        });

        function sendTemplateData() {
            window.postMessage(
                {
                    type: "templateData",
                    data,
                },
                "*",
            );
        }

        sendTemplateData();
        setTimeout(sendTemplateData, 300);
        setTimeout(sendTemplateData, 800);
        setTimeout(sendTemplateData, 1500);

        savedDataApplied = true;
    }

    function applyDataToPreview(previewDocument, data) {
        Object.entries(data).forEach(([key, value]) => {
            const element = previewDocument.getElementById(key);

            if (!element) return;

            if (element.tagName === "AUDIO") {
                let source = element.querySelector("source");

                if (source) {
                    source.setAttribute("src", value);
                } else {
                    element.setAttribute("src", value);
                }

                element.load?.();
                return;
            }

            if (element.tagName === "IMG") {
                element.setAttribute("src", value);
                return;
            }

            element.textContent = value;
        });
    }

    function runInternalSave() {
        try {
            if (typeof window.guardarLocal === "function")
                window.guardarLocal();
            if (typeof window.guardar === "function") window.guardar();
            if (typeof window.save === "function") window.save();
            if (typeof window.updatePreview === "function")
                window.updatePreview();
            if (typeof window.renderPreview === "function")
                window.renderPreview();
        } catch (error) {
            console.warn(
                "[DEDICATUAMOR] No se pudo ejecutar guardado interno",
                error,
            );
        }
    }

    function exportEditorState() {
        runInternalSave();

        const data = collectFormData();
        const iframePreview = document.getElementById("preview");
        let previewHtml = "";

        try {
            if (
                iframePreview &&
                iframePreview.contentWindow &&
                iframePreview.contentWindow.document
            ) {
                const previewDocument = iframePreview.contentWindow.document;

                applyDataToPreview(previewDocument, data);

                previewHtml = previewDocument.documentElement.outerHTML;
            }
        } catch (error) {
            console.warn(
                "[DEDICATUAMOR] No se pudo leer preview iframe",
                error,
            );
        }

        return {
            html: previewHtml,
            data,
            exportedAt: new Date().toISOString(),
        };
    }

    function boot() {
        makePlaceholders();
        hideInternalButtons();

        setTimeout(makePlaceholders, 300);
        setTimeout(makePlaceholders, 800);
        setTimeout(makePlaceholders, 1500);

        setTimeout(hideInternalButtons, 300);
        setTimeout(hideInternalButtons, 1000);
    }

    window.addEventListener("message", (event) => {
        if (!event.data) return;

        if (event.data.type === "DEDICATUAMOR_PERMISSIONS") {
            permissions = event.data.payload || null;
            hideInternalButtons();
        }

        if (event.data.type === "DEDICATUAMOR_LOAD_DATA") {
            applySavedData(event.data.payload || {});
        }

        if (event.data.type === "DEDICATUAMOR_EXPORT") {
            setTimeout(() => {
                const payload = exportEditorState();

                window.parent.postMessage(
                    {
                        type: "DEDICATUAMOR_EXPORT_RESULT",
                        payload,
                    },
                    "*",
                );
            }, 300);
        }
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }

    window.addEventListener("load", boot);
})();
