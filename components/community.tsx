"use client";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export type Question = {
  id: string;
  title: string;
  body: string;
  topic: string;
  name: string;
  time: string;
  url: string;
  solved: boolean;
  replyCount: number;
};

type Message = { id: string; name: string; body: string; time: string };

function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0] ?? "")
    .slice(0, 2)
    .join("");
}

function formatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function replyLabel(count: number) {
  return `${count} repl${count === 1 ? "y" : "ies"}`;
}

export function Community() {
  const params = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("all");
  const [selected, setSelected] = useState<string | null>(() =>
    params.get("topic"),
  );
  const [asking, setAsking] = useState(false);
  const cards = useRef<Record<string, HTMLButtonElement | null>>({});
  const askButton = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/community", {
        cache: "no-store",
        signal,
      });
      if (!res.ok) throw new Error("Request failed");
      const data: { questions: Question[]; topics: string[] } =
        await res.json();
      setQuestions(data.questions);
      setTopics(data.topics);
      setStatus("ready");
    } catch (error) {
      if ((error as Error).name !== "AbortError") setStatus("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const query = search.trim().toLowerCase();
  const filtered = questions.filter(
    (q) =>
      (topic === "all" || q.topic === topic) &&
      `${q.title} ${q.body} ${q.topic} ${q.name}`.toLowerCase().includes(query),
  );
  const discussion = filtered.find((q) => q.id === selected);

  function closeThread() {
    const card = selected ? cards.current[selected] : null;
    setSelected(null);
    requestAnimationFrame(() => card?.focus());
  }
  function reset() {
    setSearch("");
    setTopic("all");
    setSelected(null);
  }

  return (
    <>
      <section className="market-intro dark">
        <div className="container market-intro-inner">
          <div>
            <h1>Community</h1>
            <p>Ask questions and share ideas.</p>
          </div>
          <button
            ref={askButton}
            className="button secondary"
            onClick={() => setAsking(true)}
          >
            Ask a question <span aria-hidden="true">＋</span>
          </button>
        </div>
      </section>
      <section
        className="container community-main"
        aria-labelledby="questions-heading"
      >
        <div className="community-toolbar">
          <div>
            <label htmlFor="question-search">Search questions</label>
            <input
              id="question-search"
              type="search"
              placeholder="Search questions, topics or people"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setSelected(null);
              }}
            />
          </div>
          <div>
            <label htmlFor="topic-filter">Topic</label>
            <select
              id="topic-filter"
              value={topic}
              onChange={(event) => {
                setTopic(event.target.value);
                setSelected(null);
              }}
            >
              <option value="all">All topics</option>
              {topics.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="sr-only" role="status">
          {status === "loading" && "Loading discussions"}
          {status === "error" && "Could not load discussions"}
          {status === "ready" &&
            `${filtered.length} discussion${filtered.length !== 1 ? "s" : ""}${
              query || topic !== "all" ? " found" : " to explore"
            }`}
        </div>
        <div className="collection-heading">
          <h2 id="questions-heading">Developer questions</h2>
          {(query || topic !== "all") && (
            <button className="text-button" onClick={reset}>
              Reset filters
            </button>
          )}
        </div>
        <div className="community-layout">
          <div className="question-grid">
            {status === "loading" && (
              <div className="empty-state" aria-hidden="true">
                <p>Loading discussions…</p>
              </div>
            )}
            {status === "error" && (
              <div className="empty-state">
                <h3>Couldn&apos;t load discussions.</h3>
                <p>Something went wrong talking to Discord.</p>
                <button
                  className="button"
                  onClick={() => {
                    setStatus("loading");
                    load();
                  }}
                >
                  Try again
                </button>
              </div>
            )}
            {status === "ready" &&
              filtered.map((q) => (
                <button
                  key={q.id}
                  ref={(node) => {
                    cards.current[q.id] = node;
                  }}
                  className="discussion-card"
                  aria-pressed={selected === q.id}
                  aria-controls={discussion ? "discussion-panel" : undefined}
                  aria-label={`Open discussion: ${q.title}`}
                  onClick={() => setSelected(q.id)}
                >
                  <div className="discussion-card-meta">
                    <span className="tag">{q.topic}</span>
                    {q.solved && <span className="tag">Solved</span>}
                    <span>{replyLabel(q.replyCount)}</span>
                  </div>
                  <h3>{q.title}</h3>
                  <p>{q.body}</p>
                  <div className="discussion-card-author">
                    <span className="chat-avatar" aria-hidden="true">
                      {initials(q.name)}
                    </span>
                    <span>
                      <strong>{q.name}</strong>
                      <time dateTime={q.time}>{formatTime(q.time)}</time>
                    </span>
                    <span className="discussion-card-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </div>
                </button>
              ))}
            {status === "ready" && !filtered.length && (
              <div className="empty-state">
                <h3>No matching questions.</h3>
                <p>Try another search or topic to find a discussion.</p>
                <button className="button" onClick={reset}>
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
        {discussion && (
          <ThreadDrawer
            key={discussion.id}
            discussion={discussion}
            onClose={closeThread}
            heading={heading}
          />
        )}
        {asking && (
          <AskDialog
            topics={topics}
            onClose={() => {
              setAsking(false);
              requestAnimationFrame(() => askButton.current?.focus());
            }}
            onPosted={() => load()}
          />
        )}
      </section>
    </>
  );
}

type AskProps = {
  topics: string[];
  onClose: () => void;
  onPosted: () => void;
};

function AskDialog({ topics, onClose, onPosted }: AskProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<{
    phase: "idle" | "sending" | "done";
    error?: string;
    url?: string;
  }>({ phase: "idle" });

  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    return () => element.close();
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState({ phase: "sending" });
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: form.get("topic"),
          title: form.get("title"),
          question: form.get("question"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({
          phase: "idle",
          error: data.error ?? "Something went wrong. Try again.",
        });
        return;
      }
      setState({ phase: "done", url: data.url });
      onPosted();
    } catch {
      setState({ phase: "idle", error: "Network error. Try again." });
    }
  }

  const field = { display: "grid", gap: 6, marginBottom: 14 } as const;

  return (
    <dialog
      ref={dialog}
      aria-labelledby="ask-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="preview-dialog"
    >
      <h2 id="ask-title">Ask a question</h2>
      {state.phase === "done" ? (
        <>
          <p>Your question is posted.</p>
          <p>
            <a href={state.url} target="_blank" rel="noopener noreferrer">
              View it on Discord ↗
            </a>
          </p>
          <button className="button" onClick={onClose}>
            Close
          </button>
        </>
      ) : (
        <form onSubmit={submit}>
          <div style={field}>
            <label htmlFor="ask-topic">Topic</label>
            <select id="ask-topic" name="topic" defaultValue="">
              <option value="">No topic</option>
              {topics.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div style={field}>
            <label htmlFor="ask-title-input">Title</label>
            <input
              id="ask-title-input"
              name="title"
              required
              maxLength={100}
            />
          </div>
          <div style={field}>
            <label htmlFor="ask-question">Question</label>
            <textarea
              id="ask-question"
              name="question"
              required
              rows={5}
              maxLength={1900}
            />
          </div>
          {state.error && <p role="alert">{state.error}</p>}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              className="button"
              type="submit"
              disabled={state.phase === "sending"}
            >
              {state.phase === "sending" ? "Posting…" : "Post question"}
            </button>
            <button className="text-button" type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}

type ThreadProps = {
  discussion: Question;
  onClose: () => void;
  heading: React.RefObject<HTMLHeadingElement | null>;
};

function ThreadContent({ discussion, onClose, heading }: ThreadProps) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/community/${discussion.id}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data: { messages: Message[] }) => setMessages(data.messages))
      .catch((error) => {
        if (error.name !== "AbortError") setLoadError(true);
      });
    return () => controller.abort();
  }, [discussion.id]);

  const shown: Message[] = messages ?? [
    {
      id: discussion.id,
      name: discussion.name,
      body: discussion.body,
      time: discussion.time,
    },
  ];
  const replyCount = messages ? messages.length - 1 : discussion.replyCount;

  async function sendReply(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setReplyError(null);
    try {
      const res = await fetch(`/api/community/${discussion.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setReplyError(
          `${data.error ?? "Could not send your reply."}${
            data.detail ? ` (${data.detail})` : ""
          }`,
        );
        return;
      }
      setMessages((current) => [...(current ?? shown), data.message]);
      setReply("");
    } catch {
      setReplyError("Network error. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <header className="thread-header dark">
        <div className="thread-heading-row">
          <h2 id="discussion-title" ref={heading} tabIndex={-1}>
            {discussion.title}
          </h2>
          <button
            className="thread-close"
            aria-label="Close discussion"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="thread-topic">
          <span>{discussion.topic}</span>
          {discussion.solved && <span>Solved</span>}
          <span>{replyLabel(replyCount)}</span>
          <a href={discussion.url} target="_blank" rel="noopener noreferrer">
            Open in Discord ↗
          </a>
        </div>
      </header>
      <div
        className="thread-messages"
        role="region"
        aria-label="Discussion messages"
        tabIndex={0}
      >
        {shown.map((message, index) => (
          <article className="chat-message" key={message.id}>
            <span className="chat-avatar" aria-hidden="true">
              {initials(message.name)}
            </span>
            <div>
              <div className="chat-message-meta">
                <strong>{message.name}</strong>
                {index === 0 && (
                  <span className="thread-author-label">Author</span>
                )}
                <time dateTime={message.time}>{formatTime(message.time)}</time>
              </div>
              <p>{message.body}</p>
            </div>
          </article>
        ))}
        {!messages && !loadError && <p role="status">Loading replies…</p>}
        {loadError && (
          <p role="alert">
            Couldn&apos;t load the replies.{" "}
            <a href={discussion.url} target="_blank" rel="noopener noreferrer">
              View on Discord ↗
            </a>
          </p>
        )}
      </div>
      <form className="thread-composer" onSubmit={sendReply}>
        <label className="sr-only" htmlFor="thread-reply">
          Write a reply
        </label>
        <textarea
          id="thread-reply"
          rows={2}
          required
          maxLength={1900}
          placeholder="Reply to this discussion…"
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          onKeyDown={(event) => {
            // Enter，Shift + Enter 
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing &&
              !sending
            ) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        {replyError && <p role="alert">{replyError}</p>}
        <div>
          <button className="button" type="submit" disabled={sending}>
            {sending ? "Sending…" : "Reply"} <span aria-hidden="true">↗</span>
          </button>
        </div>
      </form>
    </>
  );
}

function ThreadDrawer(props: ThreadProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closingRef = useRef(false);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    const element = dialog.current!;
    function matchScreenEdge() {
      const gutter = window.innerWidth - document.documentElement.clientWidth;
      element.style.setProperty("--thread-gutter", `${gutter}px`);
    }
    matchScreenEdge();
    element.showModal();
    props.heading.current?.focus({ preventScroll: true });
    window.addEventListener("resize", matchScreenEdge);
    return () => {
      window.removeEventListener("resize", matchScreenEdge);
      element.close();
    };
  }, [props.heading]);
  function requestClose() {
    if (closingRef.current) return;
    closingRef.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      props.onClose();
    else setClosing(true);
  }
  return (
    <dialog
      ref={dialog}
      className={`thread-drawer${closing ? " is-closing" : ""}`}
      onAnimationEnd={(event) => {
        if (
          event.target === event.currentTarget &&
          event.animationName === "thread-drawer-out"
        )
          props.onClose();
      }}
      id="discussion-panel"
      aria-labelledby="discussion-title"
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:enabled, a[href], input:enabled, textarea:enabled, [tabindex="0"]',
          ),
        );
        const first = controls[0],
          last = controls[controls.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === props.heading.current)
        ) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            requestClose();
        }
      }}
    >
      <ThreadContent {...props} onClose={requestClose} />
    </dialog>
  );
}
