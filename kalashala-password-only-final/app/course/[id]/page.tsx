"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Course = {
  id: string;
  title: string;
  description: string | null;
};

type Lecture = {
  id: string;
  position: number;
  title: string;
  description: string | null;
  youtube_url: string;
};

function getYouTubeId(value: string) {
  try {
    const url = new URL(value);

    if (
      url.hostname === "youtu.be" ||
      url.hostname.endsWith(".youtu.be")
    ) {
      return (
        url.pathname
          .split("/")
          .filter(Boolean)[0] || ""
      );
    }

    return url.searchParams.get("v") || "";
  } catch {
    return "";
  }
}

export default function LessonPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [course, setCourse] =
    useState<Course | null>(null);

  const [lectures, setLectures] =
    useState<Lecture[]>([]);

  const [lecture, setLecture] =
    useState<Lecture | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(
          "/api/course",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to load course."
          );
        }

        const allLectures =
          Array.isArray(data.lectures)
            ? (data.lectures as Lecture[])
            : [];

        const selected =
          allLectures.find(
            (item) =>
              item.id === params.id
          );

        if (!selected) {
          throw new Error(
            "This lesson could not be found."
          );
        }

        setCourse(data.course);
        setLectures(allLectures);
        setLecture(selected);
      } catch (err) {
        console.error(
          "Lesson error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load lesson."
        );
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      load();
    }
  }, [params.id, router]);

  async function logout() {
    await fetch("/api/access", {
      method: "DELETE",
      credentials: "include",
    });

    window.location.replace("/login");
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf7f2",
          color: "#65453d",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        Loading lesson…
      </main>
    );
  }

  if (error || !lecture) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "60px 24px",
          background: "#faf7f2",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              padding: "16px",
              marginBottom: "20px",
              borderRadius: "10px",
              border:
                "1px solid #efc9c3",
              background: "#fff2ef",
              color: "#a62d20",
            }}
          >
            {error ||
              "Lesson not found."}
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard")
            }
            style={{
              padding:
                "11px 18px",
              borderRadius: "9px",
              border:
                "1px solid #e5d9ce",
              background: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Back to course
          </button>
        </div>
      </main>
    );
  }

  const index =
    lectures.findIndex(
      (item) =>
        item.id === lecture.id
    );

  const previous =
    index > 0
      ? lectures[index - 1]
      : null;

  const next =
    index <
    lectures.length - 1
      ? lectures[index + 1]
      : null;

  const videoId =
    getYouTubeId(
      lecture.youtube_url
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#faf7f2",
        color: "#3b1711",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <header
        style={{
          height: "72px",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#faf7f2",
          borderBottom:
            "1px solid #e5d9ce",
        }}
      >
        <button
          type="button"
          onClick={() =>
            router.push("/dashboard")
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: 0,
            border: 0,
            background: "transparent",
            color: "#3b1711",
            cursor: "pointer",
          }}
        >
          <img
            src="/kalashala-logo.jpg"
            alt="Kalashala"
            style={{
              width: "44px",
              height: "44px",
              objectFit: "contain",
            }}
          />

          <span
            style={{
              fontFamily:
                '"DM Serif Display", Georgia, serif',
              fontSize: "25px",
            }}
          >
            Kalashala
          </span>
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={() =>
              router.push("/dashboard")
            }
            style={{
              padding: "10px 16px",
              border: 0,
              background: "transparent",
              color: "#65453d",
              cursor: "pointer",
            }}
          >
            Course
          </button>

          <button
            type="button"
            onClick={logout}
            style={{
              padding: "10px 18px",
              borderRadius: "9px",
              border:
                "1px solid #e5d9ce",
              background: "white",
              color: "#3b1711",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>
      </header>

      <main
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding:
            "46px 24px 80px",
        }}
      >
        <button
          type="button"
          onClick={() =>
            router.push("/dashboard")
          }
          style={{
            padding: 0,
            border: 0,
            background: "transparent",
            color: "#65453d",
            cursor: "pointer",
            fontSize: "14px",
            marginBottom: "32px",
          }}
        >
          ← Back to lessons
        </button>

        <div
          style={{
            maxWidth: "820px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              marginBottom: "10px",
              color: "#e97817",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            Lesson{" "}
            {String(
              lecture.position
            ).padStart(2, "0")}
          </div>

          <h1
            style={{
              margin: 0,
              fontFamily:
                '"DM Serif Display", Georgia, serif',
              fontWeight: 400,
              fontSize: "52px",
              lineHeight: 1.1,
            }}
          >
            {lecture.title}
          </h1>

          {lecture.description && (
            <p
              style={{
                margin:
                  "14px 0 0",
                color: "#876f67",
                fontSize: "17px",
                lineHeight: 1.7,
              }}
            >
              {lecture.description}
            </p>
          )}
        </div>

        <div
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            overflow: "hidden",
            borderRadius: "16px",
            background: "#18120f",
            boxShadow:
              "0 18px 50px rgba(59,23,17,.12)",
          }}
        >
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={lecture.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                width: "100%",
                height: "100%",
                border: 0,
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              Invalid YouTube URL.
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          {previous ? (
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/course/${previous.id}`
                )
              }
              style={{
                padding:
                  "11px 18px",
                borderRadius: "9px",
                border:
                  "1px solid #e5d9ce",
                background: "white",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ← Previous
            </button>
          ) : (
            <span />
          )}

          {next ? (
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/course/${next.id}`
                )
              }
              style={{
                padding:
                  "11px 18px",
                borderRadius: "9px",
                border: 0,
                background:
                  "#3b1711",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Next lesson →
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard"
                )
              }
              style={{
                padding:
                  "11px 18px",
                border: 0,
                borderRadius: "9px",
                background:
                  "#3b1711",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Back to course
            </button>
          )}
        </div>
      </main>
    </div>
  );
}