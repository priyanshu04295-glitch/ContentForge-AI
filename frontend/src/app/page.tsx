"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ShieldCheck,
  FileText,
  LayoutDashboard,
  History,
  Settings,
  Upload,
  Sparkles,
  Presentation,
  FileWarning,
  Copy,
  Download,
  Plus,
  Share2,
  Check,
  X,
  LoaderCircle,
  FileUp,
  RefreshCw,
  UserRound,
  LogOut,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";
const TOKEN_KEY = "contentforge_access_token";
const USER_KEY = "contentforge_user";

type AuthUser = {
  id: number;
  name: string;
  email: string;
};

const FORMATS = [
  {
    name: "Summary",
    description: "Main ideas and essential information",
    icon: FileText,
  },
  {
    name: "Executive Summary",
    description: "Concise summary of key findings",
    icon: FileText,
  },
  {
    name: "Article",
    description: "Structured article with headings",
    icon: FileText,
  },
  {
    name: "LinkedIn Post",
    description: "Professional social media content",
    icon: Share2,
  },
  {
    name: "Advisory",
    description: "Clear findings and practical recommendations",
    icon: FileWarning,
  },
  {
    name: "Presentation",
    description: "Structured slides and speaker notes",
    icon: Presentation,
  },
  {
    name: "FAQ",
    description: "Questions and answers from your source",
    icon: FileText,
  },
];

type TransformResponse = {
  status: string;
  model: string;
  results: Record<string, string>;
  history_id?: number;
  created_at?: string;
};

type HistoryItem = {
  id: string;
  createdAt: string;
  source: string;
  formats: string[];
  audience: string;
  tone: string;
  detail: string;
  language?: string;
  length?: string;
  formatting?: string;
  source_adherence?: string;
  custom_instructions?: string;
  model: string;
  results: Record<string, string>;
};

type UploadResponse = {
  status: string;
  filename: string;
  characters: number;
  text: string;
};

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMoreFormats, setShowMoreFormats] = useState(false);

  // Verify the saved token before displaying the workspace.
  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          router.replace("/login");
          return;
        }

        const user = (await response.json()) as AuthUser;
        if (!cancelled) {
          setCurrentUser(user);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          setAuthChecked(true);
        }
      } catch {
        // Do not clear a token just because the backend is temporarily unreachable.
        if (!cancelled) {
          setAuthChecked(true);
          setError("Cannot verify your session. Make sure the backend is running.");
        }
      }
    }

    verifySession();
    return () => { cancelled = true; };
  }, [router]);

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setCurrentUser(null);
    router.replace("/login");
  }

  const [source, setSource] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("openrouter");

  const [audience, setAudience] = useState(
    "Professionals"
  );

  const [language, setLanguage] = useState("English");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [detail, setDetail] = useState("Basic");
  const [formatting, setFormatting] = useState("Structured Sections");
  const [sourceAdherence, setSourceAdherence] = useState("Strict");
  const [customInstructions, setCustomInstructions] = useState("");

  const [results, setResults] =
    useState<TransformResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [regeneratingFormat, setRegeneratingFormat] = useState("");
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  const [uploadedFilename, setUploadedFilename] = useState("");
  const [uploadedCharacters, setUploadedCharacters] = useState(0);

  const [copiedFormat, setCopiedFormat] = useState("");
  const [allCopied, setAllCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Load account-specific history from the backend database.
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    async function loadHistory() {
      try {
        const token = localStorage.getItem(TOKEN_KEY) || "";
        const response = await fetch(`${API_URL}/api/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Unable to load history.");
        const data = await response.json();
        if (!cancelled) setHistory(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        console.error("Unable to load generation history:", err);
        if (!cancelled) setError("Unable to load saved history. Please refresh the page.");
      } finally {
        if (!cancelled) setHistoryLoaded(true);
      }
    }
    loadHistory();
    return () => { cancelled = true; };
  }, [currentUser]);

  async function deleteHistoryItem(id: string) {
    try {
      const response = await fetch(`${API_URL}/api/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) || ""}` },
      });
      if (!response.ok) throw new Error("Unable to delete history item.");
      setHistory((items) => items.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete history item.");
    }
  }

  function reopenHistoryItem(item: HistoryItem) {
    setSource(item.source);
    setSelected(item.formats);
    const savedProvider = (item.model || "").split(":")[0].toLowerCase();
    if (["gemini", "groq", "openrouter"].includes(savedProvider)) setSelectedModel(savedProvider);
    setAudience(item.audience);
    setTone(item.tone);
    setDetail(item.detail);
    setLanguage(item.language || "English");
    setLength(item.length || "Medium");
    setFormatting(item.formatting || "Structured Sections");
    setSourceAdherence(item.source_adherence || "Balanced");
    setCustomInstructions(item.custom_instructions || "");
    setResults({ status: "success", model: item.model, results: item.results });
    setUploadedFilename("");
    setUploadedCharacters(0);
    setUploadMessage("Loaded a previous generation from history.");
    setError("");
    setShowHistory(false);
  }

  async function clearHistory() {
    setError("");

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError("Your session has expired. Please log in again.");
      router.replace("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/history`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setCurrentUser(null);
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to clear history. Please try again."
        );
      }

      // Update the UI only after the database confirms deletion.
      setHistory([]);
      setError("");
    } catch (err) {
      console.error("Clear history failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to clear history. Check that the backend is running."
      );
    }
  }

  // =====================================================
  // SELECT OUTPUT FORMATS
  // =====================================================

  function toggleFormat(format: string) {
    setSelected((previous) =>
      previous.includes(format)
        ? previous.filter((item) => item !== format)
        : [...previous, format]
    );

    setError("");
  }

  // =====================================================
  // UPLOAD DOCUMENT
  // =====================================================

  async function uploadDocument(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    // Allow selecting the same file again later.
    event.target.value = "";

    if (!file) return;

    setError("");
    setUploadMessage("");
    setUploading(true);

    const allowedExtensions = [".pdf", ".docx", ".txt"];

    const extension = file.name
      .slice(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setError("Please select a PDF, DOCX, or TXT file.");
      setUploading(false);
      return;
    }

    if (file.size === 0) {
      setError("The selected file is empty.");
      setUploading(false);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must not exceed 5 MB.");
      setUploading(false);
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) || ""}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to process the uploaded file."
        );
      }

      const uploadData = data as UploadResponse;

      if (
        uploadData.status !== "success" ||
        typeof uploadData.text !== "string" ||
        !uploadData.text.trim()
      ) {
        throw new Error("The server returned no extracted text.");
      }

      setSource(uploadData.text);
      setUploadedFilename(uploadData.filename);
      setUploadedCharacters(uploadData.characters);

      setResults(null);

      setUploadMessage(
        `Successfully extracted ${uploadData.characters.toLocaleString()} characters.`
      );
    } catch (err) {
      console.error("Document upload failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Upload failed. Check whether the backend is running."
      );
    } finally {
      setUploading(false);
    }
  }

  // =====================================================
  // REMOVE UPLOADED DOCUMENT
  // =====================================================

  function removeDocument() {
    setSource("");
    setUploadedFilename("");
    setUploadedCharacters(0);
    setUploadMessage("");
    setError("");
    setResults(null);
  }

  // =====================================================
  // GENERATE AI CONTENT
  // =====================================================

  async function generateContent() {
    setError("");
    setUploadMessage("");

    if (!source.trim()) {
      setError("Please enter source content or upload a document.");
      return;
    }

    if (selected.length === 0) {
      setError("Please select at least one output format.");
      return;
    }

    if (source.length > 50000) {
      setError(
        "Source content must not exceed 50,000 characters."
      );
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const response = await fetch(`${API_URL}/api/transform`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) || ""}`,
        },
        body: JSON.stringify({
          source,
          formats: selected,
          provider: selectedModel,
          language,
          audience,
          tone,
          length,
          detail,
          formatting,
          source_adherence: sourceAdherence,
          custom_instructions: customInstructions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Content generation failed."
        );
      }

      const generated = data as TransformResponse;
      setResults(generated);

      const historyItem: HistoryItem = {
        id: String(generated.history_id ?? Date.now()),
        createdAt: generated.created_at ?? new Date().toISOString(),
        source,
        formats: [...selected],
        audience,
        tone,
        detail,
        language,
        length,
        formatting,
        source_adherence: sourceAdherence,
        custom_instructions: customInstructions,
        model: generated.model,
        results: generated.results,
      };
      setHistory((items) => [historyItem, ...items].slice(0, 50));
    } catch (err) {
      console.error("Content generation failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate content. Check your backend."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // EDIT OR REGENERATE ONE OUTPUT
  // =====================================================

  function updateOutput(format: string, content: string) {
    setResults((current) => {
      if (!current) return current;
      return {
        ...current,
        results: { ...current.results, [format]: content },
      };
    });
  }

  async function regenerateOutput(format: string) {
    if (!source.trim() || !results) return;
    setError("");
    setRegeneratingFormat(format);
    try {
      const response = await fetch(`${API_URL}/api/transform`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) || ""}`,
        },
        body: JSON.stringify({
          source,
          formats: [format],
          provider: selectedModel,
          language,
          audience,
          tone,
          length,
          detail,
          formatting,
          source_adherence: sourceAdherence,
          custom_instructions: customInstructions,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || `Could not regenerate ${format}.`);
      const regenerated = data as TransformResponse;
      if (typeof regenerated.results?.[format] !== "string") {
        throw new Error(`The server did not return a new ${format}.`);
      }
      updateOutput(format, regenerated.results[format]);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not regenerate ${format}.`);
    } finally {
      setRegeneratingFormat("");
    }
  }

  // Opens a clean print view; choose “Save as PDF” in the browser print dialog.
  function downloadAsPdf(format?: string) {
    if (!results) return;
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) {
      setError("Allow pop-ups for this site to export PDF.");
      return;
    }
    const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => {
      const entities: Record<string, string> = {
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;",
      };
      return entities[char] || char;
    });
    const selectedResults = format ? [[format, results.results[format]] as [string, string]] : Object.entries(results.results);
    const sections = selectedResults.map(([format, content]) =>
      `<section><h2>${escapeHtml(format)}</h2><pre>${escapeHtml(content)}</pre></section>`
    ).join("");
    popup.document.write(`<!doctype html><html><head><title>${format ? escapeHtml(format) : "ContentForge AI Report"}</title><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;color:#1e293b;max-width:850px;margin:40px auto;line-height:1.6}h1{color:#4338ca}h2{border-bottom:1px solid #cbd5e1;padding-bottom:8px;margin-top:32px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.7 Arial,sans-serif}section{page-break-inside:avoid}@media print{body{margin:15mm}section{page-break-inside:auto}}</style></head><body><h1>ContentForge AI</h1><p>Generated content report · ${escapeHtml(new Date().toLocaleString())}</p>${sections}<script>window.onload=()=>window.print()<\/script></body></html>`);
    popup.document.close();
  }

  // =====================================================
  // COPY INDIVIDUAL OUTPUT
  // =====================================================

  async function copyIndividual(
    format: string,
    content: string
  ) {
    try {
      await navigator.clipboard.writeText(content);

      setCopiedFormat(format);

      window.setTimeout(() => {
        setCopiedFormat((previous) =>
          previous === format ? "" : previous
        );
      }, 2000);
    } catch {
      setError(
        "Unable to copy text. Check your browser clipboard permissions."
      );
    }
  }

  // =====================================================
  // COPY ALL OUTPUTS
  // =====================================================

  async function copyResults() {
    if (!results) return;

    const text = Object.entries(results.results)
      .map(
        ([format, content]) =>
          `${format}\n${"=".repeat(format.length)}\n\n${content}`
      )
      .join("\n\n\n");

    try {
      await navigator.clipboard.writeText(text);

      setAllCopied(true);

      window.setTimeout(() => {
        setAllCopied(false);
      }, 2000);
    } catch {
      setError("Unable to copy the generated content.");
    }
  }

  // =====================================================
  // DOWNLOAD JSON
  // =====================================================

  function downloadResults() {
    if (!results) return;

    const exportData = {
      application: "ContentForge AI",
      model: results.model,
      generatedAt: new Date().toISOString(),
      results: results.results,
    };

    const blob = new Blob(
      [JSON.stringify(exportData, null, 2)],
      { type: "application/json;charset=utf-8" }
    );

    downloadBlob(blob, "contentforge-ai-results.json");
  }

  // =====================================================
  // DOWNLOAD TXT
  // =====================================================

  function downloadAsText(format?: string) {
    if (!results) return;

    const text = [
      "CONTENTFORGE AI",
      "AI-Powered Content Transformation",
      "=".repeat(50),
      "",
      `AI Model: ${results.model}`,
      `Generated: ${new Date().toLocaleString()}`,
      "",
      ...(format ? [[format, results.results[format]] as [string, string][]] : Object.entries(results.results)).flatMap(
        ([format, content]) => [
          "",
          "=".repeat(50),
          format.toUpperCase(),
          "=".repeat(50),
          "",
          content,
          "",
        ]
      ),
    ].join("\n");

    const blob = new Blob(
      [text],
      { type: "text/plain;charset=utf-8" }
    );

    downloadBlob(blob, format ? `contentforge-${format.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt` : "contentforge-ai-results.txt");
  }

  // =====================================================
  // DOWNLOAD DOCX
  // =====================================================

  async function downloadAsDocx(format?: string) {
    if (!results) return;

    try {
      const {
        Document,
        Packer,
        Paragraph,
        TextRun,
        HeadingLevel,
        AlignmentType,
        PageNumber,
        Footer,
      } = await import("docx");

      const children: InstanceType<typeof Paragraph>[] = [];

      children.push(
        new Paragraph({
          text: "ContentForge AI",
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "AI-Powered Content Transformation",
              italics: true,
              color: "64748B",
              size: 22,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );

      children.push(
        new Paragraph({
          text: "Generated Content Report",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `AI Model: ${results.model}`,
              bold: true,
            }),
          ],
          spacing: { after: 100 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Generated: ${new Date().toLocaleString()}`,
              color: "64748B",
            }),
          ],
          spacing: { after: 400 },
        })
      );

      // Export one selected format, or all formats when no format is specified.
      const selectedEntries: [string, string][] = format
        ? typeof results.results[format] === "string"
          ? [[format, results.results[format]]]
          : []
        : Object.entries(results.results);

      if (selectedEntries.length === 0) {
        setError("No generated content is available to export.");
        return;
      }

      for (const [outputFormat, content] of selectedEntries) {
        children.push(
          new Paragraph({
            text: outputFormat,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 200 },
            keepNext: true,
          })
        );

        for (const line of content.split("\n")) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line || " ",
                  size: 22,
                }),
              ],
              spacing: { after: 100 },
            })
          );
        }
      }

      const doc = new Document({
        creator: "ContentForge AI",
        title: "ContentForge AI Generated Content",
        description: "AI-generated content transformation report",
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1000,
                  bottom: 1000,
                  left: 1200,
                  right: 1200,
                },
              },
            },
            children,
            footers: {
              default: new Footer({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: "ContentForge AI | Page ",
                        size: 18,
                        color: "64748B",
                      }),
                      new TextRun({
                        children: [PageNumber.CURRENT],
                        size: 18,
                        color: "64748B",
                      }),
                    ],
                  }),
                ],
              }),
            },
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const filename = format
        ? `contentforge-${format.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.docx`
        : "contentforge-ai-report.docx";

      downloadBlob(blob, filename);
    } catch (err) {
      console.error("DOCX export failed:", err);
      setError("Unable to export the Word document. Please try again.");
    }
  }

  // =====================================================
  // DOWNLOAD HELPER
  // =====================================================

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  // =====================================================
  // RESET WORKSPACE
  // =====================================================

  function resetWorkspace() {
    setSource("");
    setSelected([]);
    setAudience("Professionals");
    setTone("Professional");
    setDetail("Basic");
    setSourceAdherence("Strict");

    setResults(null);
    setError("");
    setUploadMessage("");

    setUploadedFilename("");
    setUploadedCharacters(0);

    setCopiedFormat("");
    setAllCopied(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // =====================================================
  // USER INTERFACE
  // =====================================================

  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] text-slate-700">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <LoaderCircle size={20} className="animate-spin text-indigo-600" />
          <span className="text-sm font-medium">Verifying your session…</span>
        </div>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] text-slate-700">
        <p className="text-sm">Redirecting to sign in…</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-800">

      {/* SIDEBAR */}

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200 bg-[#f5f7fb] md:flex">

        <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white">
            <img
              src="/contentforge-logo-icon.png"
              alt="ContentForge AI logo"
              className="h-10 w-10 object-contain"
            />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight">
              ContentForge AI
            </h1>
            <p className="text-xs text-slate-600">
              Intelligent Content Studio
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 p-4">

          <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-indigo-50 px-4 py-3 text-indigo-600">
            <LayoutDashboard size={19} />
            <span className="text-sm font-medium">
              Content Studio
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
          >
            <History size={19} />
            <span className="text-sm">Recent Activity</span>
            <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs">{history.length}</span>
          </button>

          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600">
            <Settings size={19} />
            <span className="text-sm">Settings</span>
            <span className="ml-auto text-xs">Soon</span>
          </div>
        </nav>

        <div className="border-t border-slate-200 p-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-indigo-600">
              <ShieldCheck size={17} />
              <span className="text-sm font-semibold">
                Privacy First
              </span>
            </div>

            <p className="text-xs leading-5 text-slate-600">
              Upload only documents you are authorized to process.
              Uploaded text is sent to the configured AI service
              when you generate content.
            </p>
          </div>
        </div>
      </aside>

      {showHistory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 p-4 md:p-8" role="dialog" aria-modal="true" aria-labelledby="history-title">
          <section className="mx-auto mt-6 max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5 md:p-6">
              <div>
                <h2 id="history-title" className="text-xl font-bold">Recent Activity</h2>
                <p className="mt-1 text-sm text-slate-500">Your last 50 generations, saved to your account.</p>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && <button onClick={clearHistory} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50">Clear history</button>}
                <button onClick={() => setShowHistory(false)} aria-label="Close history" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"><X size={18} /></button>
              </div>
            </div>
            <div className="max-h-[70vh] space-y-3 overflow-y-auto p-5 md:p-6">
              {history.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
                  <History className="mx-auto text-slate-400" size={32} />
                  <h3 className="mt-3 font-semibold">No generations yet</h3>
                  <p className="mt-1 text-sm text-slate-500">Generated content will appear here automatically.</p>
                </div>
              ) : history.map((item) => (
                <article key={item.id} className="rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <h3 className="font-semibold">{item.formats.join(" · ")}</h3>
                      <p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()} · {item.model}</p>
                      <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-sm text-slate-600">{item.source.slice(0, 280)}{item.source.length > 280 ? "…" : ""}</p>
                      <p className="mt-2 text-xs text-slate-500">{Object.keys(item.results).length} output(s) · Audience: {item.audience}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button onClick={() => reopenHistoryItem(item)} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Reopen</button>
                      <button onClick={() => deleteHistoryItem(item.id)} aria-label="Delete history item" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"><X size={17} /></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="border-t border-slate-200 px-5 py-3 text-xs leading-5 text-slate-500">Privacy note: your generation history is stored securely in the account database and is available when you sign in.</div>
          </section>
        </div>
      )}

      {showProfileModal && currentUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowProfileModal(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-dialog-title"
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 id="profile-dialog-title" className="text-lg font-bold text-slate-900">Your profile</h2>
                <p className="mt-1 text-sm text-slate-500">Account information and actions</p>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                aria-label="Close profile dialog"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                {(currentUser.name || currentUser.email || "U").trim().charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{currentUser.name}</p>
                <p className="truncate text-sm text-slate-500">{currentUser.email}</p>
                <p className="mt-1 text-xs text-slate-400">User ID: {currentUser.id}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { setShowProfileModal(false); resetWorkspace(); }}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Plus size={17} /> New Project
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-100"
            >
              <LogOut size={17} /> Log out
            </button>
          </section>
        </div>
      )}

      {/* MAIN CONTENT */}

      <main className="min-h-screen md:ml-64">

        {/* HEADER */}

        <header className="sticky top-0 z-10 flex min-h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur md:px-8">

          <div>
            <p className="text-xs text-slate-500">
              WORKSPACE / CONTENT STUDIO
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              Content Transformation
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            aria-label="Open profile menu"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm transition hover:bg-indigo-100 focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            <UserRound size={21} />
          </button>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 p-5 md:p-8">

          {/* HERO */}

          <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-indigo-50 p-6 md:p-9">

            <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full bg-indigo-50 blur-3xl" />

            <div className="relative max-w-3xl">

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600">
                <Sparkles size={14} />
                AI-POWERED CONTENT INTELLIGENCE
              </div>

              <h1 className="text-3xl font-bold leading-tight md:text-4xl">
                One source.
                <span className="text-indigo-600">
                  {" "}Multiple formats.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                Transform documents and raw text into professional,
                audience-specific content using generative AI.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  PDF Upload
                </span>
                <span className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  DOCX Upload
                </span>
                <span className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  TXT Upload
                </span>
                <span className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  7 Output Formats
                </span>
              </div>
            </div>
          </section>

          {/* WORKSPACE GRID */}

          <div className="grid grid-cols-1 gap-8">

            {/* TOP WORKSPACE: SOURCE, FORMATS, SETTINGS */}

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-stretch">

              {/* SOURCE INPUT */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 xl:col-start-1 xl:row-start-1 xl:row-span-2">

                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      Source Content
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                      Upload a document or paste your text.
                    </p>
                  </div>

                  <FileText className="text-indigo-600" size={22} />
                </div>

                {/* UPLOAD AREA */}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={uploadDocument}
                  className="hidden"
                  aria-label="Choose PDF, DOCX, or TXT file"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || loading}
                  className="group flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-7 text-center transition hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                    {uploading ? (
                      <LoaderCircle
                        size={24}
                        className="animate-spin"
                      />
                    ) : (
                      <FileUp size={24} />
                    )}
                  </div>

                  <span className="text-sm font-semibold">
                    {uploading
                      ? "Extracting document text..."
                      : "Click to upload a document"}
                  </span>

                  <span className="mt-2 text-xs text-slate-600">
                    PDF, DOCX, or TXT · Maximum 5 MB
                  </span>
                </button>

                {/* UPLOADED FILE DETAILS */}

                {uploadedFilename && (
                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                      <FileText size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-all text-sm font-medium text-emerald-700">
                        {uploadedFilename}
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {uploadedCharacters.toLocaleString()} characters extracted
                      </p>

                      {uploadMessage && (
                        <p className="mt-1 text-xs text-emerald-600">
                          {uploadMessage}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={removeDocument}
                      disabled={loading || uploading}
                      aria-label="Remove uploaded document"
                      title="Remove document"
                      className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}

                {/* SOURCE TEXT */}

                <div className="mb-2 mt-5 flex items-center justify-between">
                  <label
                    htmlFor="source"
                    className="text-sm font-medium text-slate-700"
                  >
                    Source text
                  </label>

                  <span
                    className={`text-xs ${
                      source.length > 50000
                        ? "text-red-600"
                        : "text-slate-500"
                    }`}
                  >
                    {source.length.toLocaleString()} / 50,000
                  </span>
                </div>

                <textarea
                  id="source"
                  value={source}
                  onChange={(event) => {
                    setSource(event.target.value);
                    setUploadedFilename("");
                    setUploadedCharacters(0);
                    setUploadMessage("");
                    setResults(null);
                    setError("");
                  }}
                  placeholder="Paste your report, article, research notes, or other source content here..."
                  rows={10}
                  maxLength={50000}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-[#f5f7fb] px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                />

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Your original text remains editable.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSource("");
                      setUploadedFilename("");
                      setUploadedCharacters(0);
                      setUploadMessage("");
                      setResults(null);
                      setError("");
                    }}
                    className="text-xs text-slate-600 transition hover:text-red-600"
                  >
                    Clear text
                  </button>
                </div>
              </div>

              {/* OUTPUT FORMAT SELECTION */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 xl:col-start-2 xl:row-start-1">

                <div className="mb-5">
                  <h3 className="font-semibold">
                    Output Formats
                  </h3>

                  <p className="mt-1 text-xs text-slate-600">
                    Select the content you want to generate.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  {FORMATS.slice(0, 4).map((format) => {
                    const Icon = format.icon;
                    const isSelected = selected.includes(format.name);

                    return (
                      <button
                        type="button"
                        key={format.name}
                        onClick={() => toggleFormat(format.name)}
                        aria-pressed={isSelected}
                        className={`rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-cyan-500/60 bg-indigo-50"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">

                          <div
                            className={`rounded-lg p-2 ${
                              isSelected
                                ? "bg-indigo-50 text-indigo-600"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <Icon size={20} />
                          </div>

                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                              isSelected
                                ? "border-cyan-500 bg-indigo-600 text-white"
                                : "border-slate-300"
                            }`}
                          >
                            {isSelected && <Check size={13} />}
                          </div>
                        </div>

                        <h4 className="mt-3 text-sm font-semibold">
                          {format.name}
                        </h4>

                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          {format.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setShowMoreFormats(true)}
                  className="mt-4 w-full rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                >
                  More Output Formats
                </button>

                <p className="mt-3 text-xs text-slate-500">
                  {selected.length} of {FORMATS.length} formats selected
                </p>

                {showMoreFormats && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                      if (event.target === event.currentTarget) setShowMoreFormats(false);
                    }}
                  >
                    <section
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="more-formats-title"
                      className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
                    >
                      <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                          <h3 id="more-formats-title" className="text-lg font-bold text-slate-900">All Output Formats</h3>
                          <p className="mt-1 text-sm text-slate-600">Choose any formats you want to generate.</p>
                        </div>
                        <button
                          type="button"
                          aria-label="Close output formats"
                          onClick={() => setShowMoreFormats(false)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {FORMATS.map((format) => {
                          const Icon = format.icon;
                          const isSelected = selected.includes(format.name);
                          return (
                            <button
                              type="button"
                              key={format.name}
                              onClick={() => toggleFormat(format.name)}
                              aria-pressed={isSelected}
                              className={`rounded-xl border p-4 text-left transition ${isSelected ? "border-cyan-500/70 bg-indigo-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className={`rounded-lg p-2 ${isSelected ? "bg-white text-indigo-600" : "bg-slate-100 text-slate-600"}`}>
                                  <Icon size={19} />
                                </span>
                                <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"}`}>
                                  {isSelected && <Check size={13} />}
                                </span>
                              </div>
                              <h4 className="mt-3 text-sm font-semibold text-slate-900">{format.name}</h4>
                              <p className="mt-1 text-xs leading-5 text-slate-600">{format.description}</p>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-5 flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
                        <p className="text-xs text-slate-500">{selected.length} of {FORMATS.length} formats selected</p>
                        <button
                          type="button"
                          onClick={() => setShowMoreFormats(false)}
                          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
                        >
                          Done
                        </button>
                      </div>
                    </section>
                  </div>
                )}
              </div>

              {/* GENERATION SETTINGS */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 xl:col-start-2 xl:row-start-2">

                <h3 className="mb-5 font-semibold">
                  Generation Settings
                </h3>

                <div className="space-y-5">

                  <div>
                    <label htmlFor="selectedModel" className="mb-2 block text-sm font-medium text-slate-700">
                      AI Model
                    </label>
                    <select
                      id="selectedModel"
                      value={selectedModel}
                      onChange={(event) => setSelectedModel(event.target.value)}
                      disabled={loading || regeneratingFormat !== ""}
                      className="w-full rounded-xl border border-slate-200 bg-[#f5f7fb] px-3 py-3 text-sm outline-none focus:border-indigo-500 disabled:opacity-60"
                    >
                      <option value="gemini">Google Gemini</option>
                      <option value="groq">Groq</option>
                      <option value="openrouter">OpenRouter</option>
                      <option value="contentforge" disabled>ContentForge-AI model (soon)</option>
                    </select>
                    <p className="mt-1 text-xs text-slate-500">
                      Choose which AI provider will generate your content.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="language" className="mb-2 block text-sm font-medium text-slate-700">
                        Language
                      </label>
                      <select id="language" value={language} onChange={(event) => setLanguage(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-[#f5f7fb] px-3 py-3 text-sm outline-none focus:border-indigo-500">
                        <option>English</option>
                        <option>Hindi</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="length" className="mb-2 block text-sm font-medium text-slate-700">
                        Output Length
                      </label>
                      <select id="length" value={length} onChange={(event) => setLength(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-[#f5f7fb] px-3 py-3 text-sm outline-none focus:border-indigo-500">
                        <option>Short</option>
                        <option>Medium</option>
                        <option>Long</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="audience"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Target Audience
                    </label>

                    <input
                      id="audience"
                      value={audience}
                      onChange={(event) =>
                        setAudience(event.target.value)
                      }
                      maxLength={200}
                      placeholder="e.g. Professionals"
                      className="w-full rounded-xl border border-slate-200 bg-[#f5f7fb] px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div>
                      <label
                        htmlFor="tone"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Writing Tone
                      </label>

                      <select
                        id="tone"
                        value={tone}
                        onChange={(event) =>
                          setTone(event.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-[#f5f7fb] px-3 py-3 text-sm outline-none focus:border-indigo-500"
                      >
                        <option>Professional</option>
                        <option>Formal</option>
                        <option>Casual</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="detail"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Detail Level
                      </label>

                      <select
                        id="detail"
                        value={detail}
                        onChange={(event) =>
                          setDetail(event.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-[#f5f7fb] px-3 py-3 text-sm outline-none focus:border-indigo-500"
                      >
                        <option>Basic</option>
                        <option>Balanced</option>
                        <option>Comprehensive</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="formatting" className="mb-2 block text-sm font-medium text-slate-700">
                        Formatting
                      </label>
                      <select id="formatting" value={formatting} onChange={(event) => setFormatting(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-[#f5f7fb] px-3 py-3 text-sm outline-none focus:border-indigo-500">
                        <option>Paragraphs</option>
                        <option>Bullets</option>
                        <option>Structured Sections</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="sourceAdherence" className="mb-2 block text-sm font-medium text-slate-700">
                        Source Adherence
                      </label>
                      <select id="sourceAdherence" value={sourceAdherence} onChange={(event) => setSourceAdherence(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-[#f5f7fb] px-3 py-3 text-sm outline-none focus:border-indigo-500">
                        <option>Strict</option>
                        <option>Balanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="customInstructions" className="mb-2 block text-sm font-medium text-slate-700">
                      Custom Instructions <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <textarea id="customInstructions" value={customInstructions}
                      onChange={(event) => setCustomInstructions(event.target.value)}
                      maxLength={3000} rows={3}
                      placeholder="e.g. Keep it beginner-friendly and highlight key takeaways."
                      className="w-full resize-y rounded-xl border border-slate-200 bg-[#f5f7fb] px-4 py-3 text-sm outline-none transition focus:border-indigo-500" />
                  </div>
                </div>

                {/* ERROR MESSAGE */}

                {error && (
                  <div
                    role="alert"
                    className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-6 text-red-700"
                  >
                    {error}
                  </div>
                )}

                {/* GENERATE BUTTON */}

                <button
                  type="button"
                  onClick={generateContent}
                  disabled={
                    loading ||
                    uploading ||
                    !source.trim() ||
                    selected.length === 0 ||
                    source.length > 50000
                  }
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-4 font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <LoaderCircle
                        size={19}
                        className="animate-spin"
                      />
                      Generating Content...
                    </>
                  ) : (
                    <>
                      <Sparkles size={19} />
                      Generate Content
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-xs text-slate-500">
                  Selected provider: {selectedModel === "gemini" ? "Google Gemini" : selectedModel === "groq" ? "Groq" : "OpenRouter"}.
                </p>
              </div>
            </section>

            {/* RIGHT: GENERATED RESULTS */}

            <section className="min-w-0">

              <div className="rounded-2xl border border-slate-200 bg-white">

                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5 md:p-6">

                  <div>
                    <h3 className="font-semibold">
                      Generated Content
                    </h3>

                    <p className="mt-1 text-xs text-slate-600">
                      Your transformed content appears here.
                    </p>
                  </div>

                  {results && (
                    <span className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-600">
                      <Check size={14} />
                      Generation Complete
                    </span>
                  )}
                </div>

                {/* EMPTY STATE */}

                {!results && !loading && (
                  <div className="flex min-h-[450px] flex-col items-center justify-center p-8 text-center">

                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-[#f5f7fb] text-indigo-600">
                      <Sparkles size={34} />
                    </div>

                    <h4 className="mt-6 text-lg font-semibold">
                      Ready to create
                    </h4>

                    <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
                      Upload a document or enter source text, choose
                      your output formats, and click Generate Content.
                    </p>

                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      {FORMATS.map((format) => (
                        <span
                          key={format.name}
                          className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600"
                        >
                          {format.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* LOADING STATE */}

                {loading && (
                  <div className="flex min-h-[450px] flex-col items-center justify-center p-8 text-center">

                    <LoaderCircle
                      size={42}
                      className="animate-spin text-indigo-600"
                    />

                    <h4 className="mt-6 text-lg font-semibold">
                      Transforming your content
                    </h4>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                      ContentForge AI is creating your selected formats.
                      This may take a few moments.
                    </p>
                  </div>
                )}

                {/* GENERATED OUTPUTS */}

                {results && !loading && (
                  <div className="space-y-5 p-5 md:p-6">

                    {/* EXPORT TOOLBAR */}

                    <div className="flex flex-wrap gap-2">

                      <button
                        type="button"
                        onClick={copyResults}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium transition hover:bg-slate-100"
                      >
                        {allCopied ? (
                          <Check size={14} />
                        ) : (
                          <Copy size={14} />
                        )}

                        {allCopied ? "Copied!" : "Copy All"}
                      </button>

                      <button
                        type="button"
                        onClick={downloadAsText}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium transition hover:bg-slate-100"
                      >
                        <Download size={14} />
                        TXT
                      </button>

                      <button
                        type="button"
                        onClick={downloadAsDocx}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium transition hover:bg-slate-100"
                      >
                        <Download size={14} />
                        DOCX
                      </button>

                      <button
                        type="button"
                        onClick={downloadAsPdf}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium transition hover:bg-slate-100"
                      >
                        <Download size={14} />
                        PDF
                      </button>
                    </div>

                    {/* MODEL INFORMATION */}

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                      AI Model:{" "}
                      <span className="font-medium text-indigo-600">
                        {results.model}
                      </span>
                    </div>

                    {/* OUTPUT CARDS */}

                    {Object.entries(results.results).map(
                      ([format, content]) => (
                        <article
                          key={format}
                          className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                        >

                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">

                            <div className="flex items-center gap-2">
                              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                                <FileText size={17} />
                              </div>

                              <h4 className="text-sm font-semibold">
                                {format}
                              </h4>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => copyIndividual(format, content)}
                                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs transition hover:border-cyan-500/50 hover:bg-slate-100"
                              >
                                {copiedFormat === format ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                {copiedFormat === format ? "Copied!" : "Copy"}
                              </button>
                              <button type="button" onClick={() => downloadAsText(format)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs transition hover:bg-slate-100">
                                <Download size={14} /> TXT
                              </button>
                              <button type="button" onClick={() => downloadAsDocx(format)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs transition hover:bg-slate-100">
                                <Download size={14} /> DOCX
                              </button>
                              <button type="button" onClick={() => downloadAsPdf(format)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs transition hover:bg-slate-100">
                                <Download size={14} /> PDF
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => regenerateOutput(format)}
                              disabled={regeneratingFormat !== ""}
                              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {regeneratingFormat === format ? (
                                <LoaderCircle size={14} className="animate-spin" />
                              ) : (
                                <RefreshCw size={14} />
                              )}
                              {regeneratingFormat === format ? "Regenerating…" : "Regenerate"}
                            </button>
                          </div>

                          <div className="p-4">
                            <label className="mb-2 block text-xs font-medium text-slate-500">
                              Editable output — your changes are used in downloads and Copy All
                            </label>
                            <textarea
                              aria-label={`Edit ${format} output`}
                              value={content}
                              onChange={(event) => updateOutput(format, event.target.value)}
                              rows={Math.min(24, Math.max(8, content.split("\n").length))}
                              className="w-full resize-y rounded-lg border border-slate-200 bg-white p-3 font-sans text-sm leading-7 text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                            />
                          </div>
                        </article>
                      )
                    )}

                    {/* GENERATION FOOTER */}

                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">

                      <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                        <Check size={17} />
                        Content generated successfully
                      </div>

                      <p className="mt-2 text-xs leading-5 text-slate-600">
                        Review AI-generated content for accuracy before
                        publishing or using it for important decisions.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* FOOTER */}

          <footer className="flex flex-col justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row">

            <p>
              © 2026 ContentForge AI. Intelligent Content Transformation.
            </p>

            <p className="flex items-center gap-2">
              <ShieldCheck size={14} />
              Built for responsible AI-powered productivity.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}