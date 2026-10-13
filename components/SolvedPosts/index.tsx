"use client";

import { useEffect, useState } from "react";

type SolvedPost = {
  id: string;
  title: string;
  url: string;
};

export default function SolvedPosts() {
  const [posts, setPosts] = useState<SolvedPost[]>([]);

  useEffect(() => {
    fetch("/api/solved-posts")
      .then((res) => res.json())
      .then(setPosts)
      .catch(console.error);
  }, []);

  return (
    <section>
      <h2>Solved Questions</h2>

      {posts.map((post) => (
        <a
          key={post.id}
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block border-b p-4"
        >
          {post.title}
        </a>
      ))}
    </section>
  );
}