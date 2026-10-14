"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Action } from "./site-shell";
import { communityQuestions, topics, type Question } from "@/lib/demo-data";

function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");
}

export function Community() {
  const params = useSearchParams();
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("all");
  const [selected, setSelected] = useState<string | null>(() =>
    communityQuestions.some((q) => q.id === params.get("topic"))
      ? params.get("topic")
      : null,
  );
  const cards = useRef<Record<string, HTMLButtonElement | null>>({});
  const heading = useRef<HTMLHeadingElement>(null);
  const query = search.trim().toLowerCase();
  const filtered = communityQuestions.filter(
    (q) =>
      (topic === "all" || q.topic === topic) &&
      `${q.title} ${q.body} ${q.topic} ${q.name} ${q.replies.map((r) => `${r.name} ${r.body}`).join(" ")}`
        .toLowerCase()
        .includes(query),
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
          <Action flow="question" className="button secondary">
            Ask a question <span aria-hidden="true">＋</span>
          </Action>
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
          {filtered.length} discussion{filtered.length !== 1 && "s"}
          {query || topic !== "all" ? " found" : " to explore"}
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
            {filtered.map((q) => (
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
                  <span>
                    {q.replies.length} repl
                    {q.replies.length === 1 ? "y" : "ies"}
                  </span>
                </div>
                <h3>{q.title}</h3>
                <p>{q.body}</p>
                <div className="discussion-card-author">
                  <span className="chat-avatar" aria-hidden="true">
                    {initials(q.name)}
                  </span>
                  <span>
                    <strong>{q.name}</strong>
                    <time dateTime={q.time}>{q.time}</time>
                  </span>
                  <span className="discussion-card-arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>
              </button>
            ))}
            {!filtered.length && (
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
      </section>
    </>
  );
}

type ThreadProps = {
  discussion: Question;
  onClose: () => void;
  heading: React.RefObject<HTMLHeadingElement | null>;
};
function ThreadContent({ discussion, onClose, heading }: ThreadProps) {
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
          <span>
            {discussion.replies.length} repl
            {discussion.replies.length === 1 ? "y" : "ies"}
          </span>
        </div>
      </header>
      <div
        className="thread-messages"
        role="region"
        aria-label="Discussion messages"
        tabIndex={0}
      >
        {[discussion, ...discussion.replies].map((message, index) => (
          <article
            className="chat-message"
            key={`${message.name}-${message.time}`}
          >
            <span className="chat-avatar" aria-hidden="true">
              {initials(message.name)}
            </span>
            <div>
              <div className="chat-message-meta">
                <strong>{message.name}</strong>
                {index === 0 && (
                  <span className="thread-author-label">Author</span>
                )}
                <time dateTime={message.time}>{message.time}</time>
              </div>
              <p>{message.body}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="thread-composer">
        <label className="sr-only" htmlFor="thread-reply">
          Write a reply
        </label>
        <textarea
          id="thread-reply"
          disabled
          rows={2}
          placeholder="Reply to this discussion…"
        />
        <div>
          <Action flow="reply">
            Reply <span aria-hidden="true">↗</span>
          </Action>
        </div>
      </div>
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
            'button:enabled, [tabindex="0"]',
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
