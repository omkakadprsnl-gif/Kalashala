"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { getSupabaseBrowser } from "@/lib/supabase";

type Lecture = {
  id: string;
  position: number;
  title: string;
  description: string | null;
  youtube_url: string;
};

function getYouTubeId(input: string): string {
  try {
    const url = new URL(input);

    if (
      url.hostname === "youtu.be" ||
      url.hostname.endsWith(".youtu.be")
    ) {
      return url.pathname
        .split("/")
        .filter(Boolean)[0] || "";
    }

    return url.searchParams.get("v") || "";
  } catch {
    return "";
  }
}

async function withTimeout<T>(
  promise: PromiseLike<T>,
  milliseconds = 10000
): Promise<T> {
  return await Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error("Supabase request timed out.")),
        milliseconds
      )
    ),
  ]);
}

export default function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [courseId, setCourseId] = useState("");
  const [courseTitle, setCourseTitle] = useState("");

  const [lectures, setLectures] = useState<Lecture[]>([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lecture | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const supabase = getSupabaseBrowser();

        if (!supabase) {
          throw new Error(
            "Supabase is not configured. Check your .env.local file."
          );
        }

        const {
          data: { user },
          error: userError,
        } = await withTimeout(
          supabase.auth.getUser()
        );

        if (userError) {
          throw new Error(userError.message);
        }

        if (!user) {
          window.location.href =
            "/revatigawandeadmin";
          return;
        }

        const { data: profile, error: profileError } =
          await withTimeout(
            supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .maybeSingle()
          );

        if (profileError) {
          throw new Error(profileError.message);
        }

        if (profile?.role !== "admin") {
          await supabase.auth.signOut();

          window.location.href =
            "/revatigawandeadmin";

          return;
        }

        const { data: courses, error: courseError } =
          await withTimeout(
            supabase
              .from("courses")
              .select("id,title")
              .order("created_at", {
                ascending: true,
              })
              .limit(1)
          );

        if (courseError) {
          throw new Error(courseError.message);
        }

        const course = courses?.[0];

        if (!course) {
          if (mounted) {
            setAuthorized(true);
            setLoading(false);
            setError(
              "No course has been created yet. Open Edit settings to create or configure the course."
            );
          }

          return;
        }

        const {
          data: lectureRows,
          error: lectureError,
        } = await withTimeout(
          supabase
            .from("lectures")
            .select(
              "id,position,title,description,youtube_url"
            )
            .eq("course_id", course.id)
            .order("position", {
              ascending: true,
            })
        );

        if (lectureError) {
          throw new Error(lectureError.message);
        }

        if (!mounted) return;

        setCourseId(course.id);
        setCourseTitle(course.title || "");
        setLectures(
          (lectureRows || []) as Lecture[]
        );

        setAuthorized(true);
        setLoading(false);
      } catch (err) {
        console.error(
          "Admin panel initialization error:",
          err
        );

        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load the admin panel."
        );

        setLoading(false);
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  function openNewLecture() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setYoutubeUrl("");
    setMessage("");
    setError("");
    setShowForm(true);
  }

  function openEditLecture(
    lecture: Lecture
  ) {
    setEditing(lecture);
    setTitle(lecture.title);
    setDescription(
      lecture.description || ""
    );
    setYoutubeUrl(lecture.youtube_url);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  async function reloadLectures() {
    const supabase = getSupabaseBrowser();

    if (!supabase || !courseId) {
      return;
    }

    const {
      data,
      error: lectureError,
    } = await supabase
      .from("lectures")
      .select(
        "id,position,title,description,youtube_url"
      )
      .eq("course_id", courseId)
      .order("position", {
        ascending: true,
      });

    if (lectureError) {
      setError(lectureError.message);
      return;
    }

    setLectures((data || []) as Lecture[]);
  }

  async function saveLecture(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    const supabase = getSupabaseBrowser();

    if (!supabase) {
      setError(
        "Supabase is not configured."
      );
      return;
    }

    if (!courseId) {
      setError(
        "No course exists yet. Configure the course first."
      );
      return;
    }

    if (!title.trim()) {
      setError(
        "Lecture title is required."
      );
      return;
    }

    if (!getYouTubeId(youtubeUrl)) {
      setError(
        "Please enter a valid YouTube URL."
      );
      return;
    }

    setSaving(true);

    try {
      if (editing) {
        const { error } =
          await supabase
            .from("lectures")
            .update({
              title: title.trim(),
              description:
                description.trim() || null,
              youtube_url:
                youtubeUrl.trim(),
            })
            .eq("id", editing.id);

        if (error) {
          throw new Error(error.message);
        }

        setMessage(
          "Lecture updated successfully."
        );
      } else {
        const nextPosition =
          lectures.length > 0
            ? Math.max(
                ...lectures.map(
                  (lecture) =>
                    lecture.position
                )
              ) + 1
            : 1;

        const { error } =
          await supabase
            .from("lectures")
            .insert({
              course_id: courseId,
              position: nextPosition,
              title: title.trim(),
              description:
                description.trim() || null,
              youtube_url:
                youtubeUrl.trim(),
            });

        if (error) {
          throw new Error(error.message);
        }

        setMessage(
          "Lecture published successfully."
        );
      }

      await reloadLectures();

      setShowForm(false);
      setEditing(null);
      setTitle("");
      setDescription("");
      setYoutubeUrl("");
    } catch (err) {
      console.error(
        "Lecture save error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save lecture."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteLecture(
    lecture: Lecture
  ) {
    const confirmed = window.confirm(
      `Delete "${lecture.title}"?`
    );

    if (!confirmed) {
      return;
    }

    const supabase = getSupabaseBrowser();

    if (!supabase) {
      setError(
        "Supabase is not configured."
      );
      return;
    }

    setMessage("");
    setError("");

    const { error: deleteError } =
      await supabase
        .from("lectures")
        .delete()
        .eq("id", lecture.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await reloadLectures();

    setMessage(
      "Lecture deleted successfully."
    );
  }

  async function signOut() {
    const supabase = getSupabaseBrowser();

    if (supabase) {
      await supabase.auth.signOut();
    }

    window.location.href =
      "/revatigawandeadmin";
  }

  if (loading) {
    return (
      <div className="site-shell">
        <NavBar admin />

        <main className="container page-loading">
          Loading admin panel…
        </main>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="site-shell">
        <NavBar admin />

        <main className="container admin-main">
          <div className="message error">
            {error ||
              "You are not authorized to access this page."}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="site-shell">
      <NavBar admin />

      <main className="container admin-main">
        <div className="admin-head">
          <div>
            <div className="eyebrow">
              Administration
            </div>

            <h1>Course management</h1>
          </div>

          <button
            className="btn btn-outline"
            type="button"
            onClick={signOut}
          >
            Sign out
          </button>
        </div>

        {error && (
          <div className="message error">
            {error}
          </div>
        )}

        {message && (
          <div className="message info">
            {message}
          </div>
        )}

        <section className="admin-panel">
          <div className="panel-heading panel-heading-actions">
            <div>
              <div className="eyebrow">
                Course
              </div>

              <h2>
                {courseTitle ||
                  "Course settings"}
              </h2>

              <p className="sub">
                Manage the course details and
                student access password.
              </p>
            </div>

            <Link
              href="/revatigawandeadmin/settings"
              className="btn btn-outline"
            >
              Edit settings
            </Link>
          </div>
        </section>

        <section className="admin-panel">
          <div className="panel-heading panel-heading-actions">
            <div>
              <div className="eyebrow">
                Lectures
              </div>

              <h2>
                {lectures.length}{" "}
                {lectures.length === 1
                  ? "lecture"
                  : "lectures"}
              </h2>
            </div>

            <button
              className="btn btn-primary"
              type="button"
              onClick={openNewLecture}
              disabled={!courseId}
            >
              Add lecture
            </button>
          </div>

          {lectures.length === 0 ? (
            <div className="admin-empty">
              No lectures have been added yet.
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Lecture</th>
                    <th>YouTube</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {lectures.map(
                    (lecture) => (
                      <tr
                        key={lecture.id}
                      >
                        <td>
                          {String(
                            lecture.position
                          ).padStart(
                            2,
                            "0"
                          )}
                        </td>

                        <td>
                          <strong>
                            {
                              lecture.title
                            }
                          </strong>

                          {lecture.description && (
                            <div
                              style={{
                                marginTop:
                                  4,
                                fontSize:
                                  13,
                                opacity:
                                  0.7,
                              }}
                            >
                              {
                                lecture.description
                              }
                            </div>
                          )}
                        </td>

                        <td>
                          {getYouTubeId(
                            lecture.youtube_url
                          )
                            ? "Connected"
                            : "Invalid"}
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              className="text-button"
                              type="button"
                              onClick={() =>
                                openEditLecture(
                                  lecture
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="text-button danger"
                              type="button"
                              onClick={() =>
                                deleteLecture(
                                  lecture
                                )
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {showForm && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal">
            <div className="modal-heading">
              <div>
                <div className="eyebrow">
                  Lecture
                </div>

                <h2>
                  {editing
                    ? "Edit lecture"
                    : "Add lecture"}
                </h2>
              </div>

              <button
                className="text-button"
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
              >
                Close
              </button>
            </div>

            <form
              className="admin-form"
              onSubmit={saveLecture}
            >
              <div className="field">
                <label htmlFor="lecture-title">
                  Lecture title
                </label>

                <input
                  id="lecture-title"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  required
                  placeholder="Enter lecture title"
                />
              </div>

              <div className="field">
                <label htmlFor="lecture-description">
                  Description
                </label>

                <textarea
                  id="lecture-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Optional lecture description"
                />
              </div>

              <div className="field">
                <label htmlFor="lecture-youtube">
                  Unlisted YouTube URL
                </label>

                <input
                  id="lecture-youtube"
                  type="url"
                  value={youtubeUrl}
                  onChange={(event) =>
                    setYoutubeUrl(
                      event.target.value
                    )
                  }
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving…"
                    : editing
                    ? "Save changes"
                    : "Publish lecture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}