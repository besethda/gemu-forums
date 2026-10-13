"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Action } from "./site-shell";
import { sampleQuestions, topics } from "@/lib/demo-data";

export function Community() {
  const params = useSearchParams();
  const questions = sampleQuestions;
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("all");
  const [selected, setSelected] = useState(
    params.get("topic") ?? sampleQuestions[0].id,
  );
  const heading = useRef<HTMLHeadingElement>(null);
  const query = search.trim().toLowerCase();
  const filtered = questions.filter(
    (q) =>
      (topic === "all" || q.topic === topic) &&
      `${q.title} ${q.body} ${q.topic} ${q.replies.map((r) => r.body).join(" ")}`
        .toLowerCase()
        .includes(query),
  );
  const discussion = filtered.find((q) => q.id === selected) ?? filtered[0];
  function reset() {
    setSearch("");
    setTopic("all");
  }
  return (
    <>
      <section className="page-intro dark grid-surface">
        <div className="container page-intro-layout">
          <div>
            <p className="eyebrow">Developer community</p>
            <h1>
              Find an answer.
              <br />
              Keep building.
            </h1>
            <p className="lead">
              A place for voxel questions, shared knowledge and the people
              making games.
            </p>
            <Action flow="question">
              Ask a question <span aria-hidden="true">＋</span>
            </Action>
          </div>
          <figure className="intro-visual">
            <Image
              src="/gemu/voxel-world.png"
              alt="Voxel environment concept with forest and a riverside outpost"
              width={1672}
              height={941}
              sizes="(max-width: 800px) 100vw, 35vw"
              preload
            />
            <figcaption>AI concept illustration</figcaption>
          </figure>
        </div>
      </section>
      <section
        className="section container browse-section"
        aria-labelledby="questions-heading"
      >
        <div className="section-heading">
          <h2 id="questions-heading">Developer questions</h2>
          <span className="tag">Sample discussions · Forum preview</span>
        </div>
        <div className="filter-row">
          <div className="search-field">
            <label htmlFor="question-search">Search questions</label>
            <input
              id="question-search"
              type="search"
              placeholder="Try multiplayer, assets or access"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="topic-filter">Topic</label>
            <select
              id="topic-filter"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              <option value="all">All topics</option>
              {topics.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="result-count" role="status">
          {filtered.length} discussion{filtered.length !== 1 && "s"}
          {query || topic !== "all" ? " matching your filters" : " to explore"}
        </p>
        <div className="forum-layout">
          <div className="question-list">
            {filtered.map((q) => (
              <button
                key={q.id}
                className="question-card"
                aria-pressed={discussion?.id === q.id}
                aria-controls="discussion-panel"
                onClick={() => {
                  setSelected(q.id);
                  heading.current?.focus();
                }}
              >
                <div className="card-meta">
                  <span className="tag">{q.topic}</span>
                  <span className="small">{q.origin}</span>
                </div>
                <h3>{q.title}</h3>
                <p>{q.body}</p>
                <div className="card-bottom">
                  <span>
                    {q.replies.length} repl
                    {q.replies.length === 1 ? "y" : "ies"} · Sample discussion
                  </span>
                  <span aria-hidden="true">→</span>
                </div>
              </button>
            ))}
            {!filtered.length && (
              <div className="empty-state">
                <h3>No matching questions.</h3>
                <p>
                  Try another search or topic, or view the question form
                  placeholder.
                </p>
                <div className="actions">
                  <button className="button" onClick={reset}>
                    Clear filters
                  </button>
                  <Action flow="question" className="button secondary">
                    Ask a question
                  </Action>
                </div>
              </div>
            )}
          </div>
          <section
            className="detail-panel"
            id="discussion-panel"
            aria-labelledby="discussion-title"
          >
            <p className="eyebrow">Discussion</p>
            <h2 id="discussion-title" ref={heading} tabIndex={-1}>
              {discussion?.title ?? "Find a discussion"}
            </h2>
            {discussion ? (
              <>
                <div className="detail-meta">
                  <span className="tag">{discussion.topic}</span>
                  <span className="small">Sample content</span>
                </div>
                <div className="messages">
                  {[discussion, ...discussion.replies].map((message, i) => (
                    <article className="message" key={i}>
                      <div className="message-meta">
                        <strong>{message.name}</strong>
                        <span className="origin">{message.origin}</span>
                      </div>
                      <p>{message.body}</p>
                    </article>
                  ))}
                </div>
                <div className="actions">
                  <Action flow="reply">
                    Reply on website <span aria-hidden="true">↗</span>
                  </Action>
                </div>
                <p className="small panel-note">
                  Illustrative discussion only. Ask and Reply open form
                  placeholders; posting will be added later.
                </p>
              </>
            ) : (
              <p>
                Choose another search or topic to see the sample conversations.
              </p>
            )}
          </section>
        </div>
      </section>
      <section className="community-explainer">
        <div className="container two-column">
          <div>
            <p className="eyebrow">A place to keep building</p>
            <h2>
              Share a question.
              <br />
              Find a starting point.
            </h2>
          </div>
          <div>
            <p>
              Browse questions about getting started, multiplayer and voxel
              assets. Open a discussion to see its sample replies.
            </p>
            <p className="small">
              This first draft is a forum preview. Accounts, posting and
              moderation will be added later.
            </p>
            <Action flow="question" className="text-button">
              View question placeholder <span aria-hidden="true">↗</span>
            </Action>
          </div>
        </div>
      </section>
    </>
  );
}
