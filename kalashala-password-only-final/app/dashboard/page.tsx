"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

function getYouTubeId(urlString: string) {
  try {
    const url = new URL(urlString);

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

export default function DashboardPage() {
  const router = useRouter();

  const [course, setCourse] =
    useState<Course | null>(null);

  const [lectures, setLectures] =
    useState<Lecture[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadCourse() {
      try {
        const response = await fetch(
          "/api/course",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const contentType =
          response.headers.get(
            "content-type"
          ) || "";

        if (
          !contentType.includes(
            "application/json"
          )
        ) {
          throw new Error(
            `Course request returned ${response.status}.`
          );
        }

        const data =
          await response.json();

        if (response.status === 401) {
          window.location.replace(
            "/login"
          );
          return;
        }

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to load course."
          );
        }

        setCourse(
          data.course || null
        );

        setLectures(
          Array.isArray(data.lectures)
            ? data.lectures
            : []
        );
      } catch (err) {
        console.error(
          "Dashboard error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load course."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, []);

  async function logout() {
    await fetch("/api/access", {
      method: "DELETE",
      credentials: "include",
    });

    window.location.replace(
      "/login"
    );
  }

  function openLesson(id: string) {
    router.push(`/course/${id}`);
  }

  /*
   * Always sort the actual curriculum by
   * lesson position.
   *
   * 01 → 02 → 03 → 04...
   */
  const orderedLectures = useMemo(() => {
    return [...lectures].sort(
      (a, b) =>
        a.position - b.position
    );
  }, [lectures]);

  /*
   * Newest lecture = highest lesson position.
   */
  const newestLecture =
    orderedLectures.length > 0
      ? orderedLectures[
          orderedLectures.length - 1
        ]
      : null;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf7f2",
          color: "#65453d",
          fontFamily:
            "Inter, Arial, sans-serif",
        }}
      >
        Loading course…
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#faf7f2",
          padding:
            "60px 24px",
          fontFamily:
            "Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              padding:
                "18px 20px",
              borderRadius: "12px",
              background:
                "#fff2ef",
              border:
                "1px solid #efc9c3",
              color: "#a62d20",
            }}
          >
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#faf7f2",
        color: "#3b1711",
        fontFamily:
          "Inter, Arial, sans-serif",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        style={{
          height: "76px",
          padding:
            "0 clamp(20px, 4vw, 54px)",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          borderBottom:
            "1px solid #e8ddd4",
          background:
            "rgba(250,247,242,0.96)",
          position: "sticky",
          top: 0,
          zIndex: 20,
          backdropFilter:
            "blur(10px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <img
            src="/kalashala-logo.jpg"
            alt="Kalashala"
            style={{
              width: "46px",
              height: "46px",
              objectFit:
                "contain",
            }}
          />

          <div
            style={{
              fontFamily:
                '"DM Serif Display", Georgia, serif',
              fontSize: "25px",
            }}
          >
            Kalashala
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          style={{
            padding:
              "10px 17px",
            borderRadius: "9px",
            border:
              "1px solid #ded1c7",
            background: "#fff",
            color: "#3b1711",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </header>

      <main
        style={{
          width:
            "min(calc(100% - 40px), 1120px)",
          margin: "0 auto",
          padding:
            "54px 0 100px",
        }}
      >
        {/* =====================================================
            COURSE HERO
        ===================================================== */}

        <section
          style={{
            padding:
              "44px 46px",
            borderRadius: "22px",
            background:
              "linear-gradient(135deg, #ffffff 0%, #f8eee4 100%)",
            border:
              "1px solid #e5d8ce",
            boxShadow:
              "0 14px 50px rgba(59,23,17,.05)",
            marginBottom: "62px",
          }}
        >
          <div
            style={{
              maxWidth: "790px",
            }}
          >
            <div
              style={{
                display:
                  "inline-flex",
                padding:
                  "7px 12px",
                marginBottom:
                  "17px",
                borderRadius:
                  "999px",
                background:
                  "#f7e3cf",
                color:
                  "#dc6d16",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing:
                  ".18em",
                textTransform:
                  "uppercase",
              }}
            >
              Your course
            </div>

            <h1
              style={{
                margin: 0,
                fontFamily:
                  '"DM Serif Display", Georgia, serif',
                fontSize:
                  "clamp(44px, 6vw, 70px)",
                lineHeight: 1.02,
                fontWeight: 400,
              }}
            >
              {course?.title ||
                "Your course"}
            </h1>

            {course?.description && (
              <p
                style={{
                  margin:
                    "18px 0 0",
                  maxWidth:
                    "700px",
                  color:
                    "#765e55",
                  fontSize: "17px",
                  lineHeight: 1.75,
                }}
              >
                {course.description}
              </p>
            )}

            <div
              style={{
                marginTop:
                  "23px",
                color:
                  "#8b756c",
                fontSize: "14px",
              }}
            >
              {orderedLectures.length}{" "}
              {orderedLectures.length ===
              1
                ? "lesson"
                : "lessons"}
            </div>
          </div>
        </section>

        {/* =====================================================
            NEWEST LECTURE
        ===================================================== */}

        {newestLecture && (
          <section
            style={{
              marginBottom:
                "64px",
            }}
          >
            <div
              style={{
                marginBottom:
                  "20px",
              }}
            >
              <div
                style={{
                  color:
                    "#e97817",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing:
                    ".22em",
                  textTransform:
                    "uppercase",
                  marginBottom:
                    "8px",
                }}
              >
                Recently added
              </div>

              <h2
                style={{
                  margin: 0,
                  fontFamily:
                    '"DM Serif Display", Georgia, serif',
                  fontSize:
                    "clamp(34px, 4vw, 46px)",
                  fontWeight: 400,
                }}
              >
                Newest lecture
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                openLesson(
                  newestLecture.id
                )
              }
              style={{
                width: "100%",
                padding: 0,
                textAlign: "left",
                display: "grid",
                gridTemplateColumns:
                  "minmax(300px, 0.95fr) 1.05fr",
                background:
                  "#ffffff",
                border:
                  "1px solid #e2d5ca",
                borderRadius:
                  "20px",
                overflow:
                  "hidden",
                cursor:
                  "pointer",
                color:
                  "#3b1711",
                boxShadow:
                  "0 12px 40px rgba(59,23,17,.07)",
              }}
            >
              {/* NEWEST THUMBNAIL */}

              <div
                style={{
                  position:
                    "relative",
                  aspectRatio:
                    "16 / 10",
                  background:
                    "#eee4da",
                  overflow:
                    "hidden",
                }}
              >
                {getYouTubeId(
                  newestLecture.youtube_url
                ) ? (
                  <img
                    src={`https://img.youtube.com/vi/${getYouTubeId(
                      newestLecture.youtube_url
                    )}/hqdefault.jpg`}
                    alt=""
                    style={{
                      width:
                        "100%",
                      height:
                        "100%",
                      objectFit:
                        "cover",
                      display:
                        "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height:
                        "100%",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      color:
                        "#876f67",
                    }}
                  >
                    Kalashala
                  </div>
                )}

                {/* NEWEST BADGE */}

                <div
                  style={{
                    position:
                      "absolute",
                    left: "16px",
                    top: "16px",
                    padding:
                      "8px 12px",
                    borderRadius:
                      "8px",
                    background:
                      "#3b1711",
                    color:
                      "#ffffff",
                    fontSize:
                      "11px",
                    fontWeight:
                      700,
                    letterSpacing:
                      ".08em",
                    textTransform:
                      "uppercase",
                  }}
                >
                  New
                </div>

                {/* PLAY */}

                <div
                  style={{
                    position:
                      "absolute",
                    left:
                      "50%",
                    top:
                      "50%",
                    transform:
                      "translate(-50%, -50%)",
                    width:
                      "60px",
                    height:
                      "60px",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    borderRadius:
                      "50%",
                    background:
                      "rgba(59,23,17,.94)",
                    color:
                      "#fff",
                    boxShadow:
                      "0 8px 24px rgba(0,0,0,.22)",
                  }}
                >
                  <span
                    style={{
                      marginLeft:
                        "3px",
                      fontSize:
                        "19px",
                    }}
                  >
                    ▶
                  </span>
                </div>
              </div>

              {/* NEWEST CONTENT */}

              <div
                style={{
                  padding:
                    "34px 36px",
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  justifyContent:
                    "center",
                }}
              >
                <div
                  style={{
                    color:
                      "#e97817",
                    fontSize:
                      "12px",
                    fontWeight:
                      700,
                    letterSpacing:
                      ".12em",
                    marginBottom:
                      "12px",
                  }}
                >
                  LESSON{" "}
                  {String(
                    newestLecture.position
                  ).padStart(
                    2,
                    "0"
                  )}
                </div>

                <h3
                  style={{
                    margin: 0,
                    fontFamily:
                      '"DM Serif Display", Georgia, serif',
                    fontSize:
                      "clamp(28px, 3vw, 38px)",
                    fontWeight: 400,
                    lineHeight:
                      1.12,
                  }}
                >
                  {
                    newestLecture.title
                  }
                </h3>

                {newestLecture.description && (
                  <p
                    style={{
                      margin:
                        "14px 0 0",
                      color:
                        "#876f67",
                      fontSize:
                        "15px",
                      lineHeight:
                        1.65,
                      display:
                        "-webkit-box",
                      WebkitLineClamp:
                        3,
                      WebkitBoxOrient:
                        "vertical",
                      overflow:
                        "hidden",
                    }}
                  >
                    {
                      newestLecture.description
                    }
                  </p>
                )}

                <div
                  style={{
                    marginTop:
                      "24px",
                    color:
                      "#e97817",
                    fontSize:
                      "14px",
                    fontWeight:
                      700,
                  }}
                >
                  Watch newest lecture →
                </div>
              </div>
            </button>
          </section>
        )}

        {/* =====================================================
            ALL LESSONS
        ===================================================== */}

        <section>
          <div
            style={{
              display:
                "flex",
              alignItems:
                "flex-end",
              justifyContent:
                "space-between",
              gap: "20px",
              marginBottom:
                "22px",
            }}
          >
            <div>
              <div
                style={{
                  color:
                    "#e97817",
                  fontSize:
                    "11px",
                  fontWeight:
                    700,
                  letterSpacing:
                    ".22em",
                  textTransform:
                    "uppercase",
                  marginBottom:
                    "8px",
                }}
              >
                Curriculum
              </div>

              <h2
                style={{
                  margin: 0,
                  fontFamily:
                    '"DM Serif Display", Georgia, serif',
                  fontSize:
                    "clamp(34px, 4vw, 46px)",
                  fontWeight:
                    400,
                }}
              >
                All lessons
              </h2>
            </div>

            <div
              style={{
                color:
                  "#8b756c",
                fontSize:
                  "14px",
              }}
            >
              {orderedLectures.length}{" "}
              total
            </div>
          </div>

          {orderedLectures.length ===
          0 ? (
            <div
              style={{
                padding:
                  "50px 30px",
                textAlign:
                  "center",
                border:
                  "1px solid #e5d9ce",
                borderRadius:
                  "16px",
                background:
                  "#fff",
                color:
                  "#876f67",
              }}
            >
              No lessons have
              been published
              yet.
            </div>
          ) : (
            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "22px",
              }}
            >
              {orderedLectures.map(
                (lecture) => {
                  const videoId =
                    getYouTubeId(
                      lecture.youtube_url
                    );

                  const thumbnail =
                    videoId
                      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                      : null;

                  return (
                    <button
                      key={
                        lecture.id
                      }
                      type="button"
                      onClick={() =>
                        openLesson(
                          lecture.id
                        )
                      }
                      style={{
                        padding:
                          0,
                        textAlign:
                          "left",
                        border:
                          "1px solid #e4d8cf",
                        borderRadius:
                          "17px",
                        background:
                          "#fff",
                        overflow:
                          "hidden",
                        color:
                          "#3b1711",
                        cursor:
                          "pointer",
                        boxShadow:
                          "0 6px 22px rgba(59,23,17,.035)",
                      }}
                    >
                      {/* THUMBNAIL */}

                      <div
                        style={{
                          width:
                            "100%",
                          aspectRatio:
                            "16 / 9",
                          background:
                            "#eee5dc",
                          overflow:
                            "hidden",
                          position:
                            "relative",
                        }}
                      >
                        {thumbnail ? (
                          <img
                            src={
                              thumbnail
                            }
                            alt=""
                            loading="lazy"
                            style={{
                              width:
                                "100%",
                              height:
                                "100%",
                              objectFit:
                                "cover",
                              display:
                                "block",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width:
                                "100%",
                              height:
                                "100%",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              color:
                                "#876f67",
                              fontSize:
                                "13px",
                            }}
                          >
                            Kalashala
                          </div>
                        )}

                        {/* CLEAR LESSON NUMBER */}

                        <div
                          style={{
                            position:
                              "absolute",
                            top:
                              "14px",
                            left:
                              "14px",
                            minWidth:
                              "42px",
                            height:
                              "34px",
                            padding:
                              "0 9px",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            borderRadius:
                              "8px",
                            background:
                              "#ffffff",
                            color:
                              "#3b1711",
                            fontSize:
                              "13px",
                            fontWeight:
                              800,
                            boxShadow:
                              "0 3px 12px rgba(0,0,0,.15)",
                          }}
                        >
                          {String(
                            lecture.position
                          ).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        {/* PLAY */}

                        <div
                          style={{
                            position:
                              "absolute",
                            left:
                              "50%",
                            top:
                              "50%",
                            transform:
                              "translate(-50%, -50%)",
                            width:
                              "54px",
                            height:
                              "54px",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            borderRadius:
                              "50%",
                            background:
                              "rgba(59,23,17,.94)",
                            color:
                              "#fff",
                            boxShadow:
                              "0 6px 20px rgba(0,0,0,.2)",
                          }}
                        >
                          <span
                            style={{
                              marginLeft:
                                "3px",
                              fontSize:
                                "17px",
                            }}
                          >
                            ▶
                          </span>
                        </div>
                      </div>

                      {/* CONTENT */}

                      <div
                        style={{
                          padding:
                            "19px 20px 22px",
                        }}
                      >
                        <div
                          style={{
                            color:
                              "#e97817",
                            fontSize:
                              "11px",
                            fontWeight:
                              700,
                            letterSpacing:
                              ".12em",
                            marginBottom:
                              "7px",
                          }}
                        >
                          LESSON{" "}
                          {String(
                            lecture.position
                          ).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <h3
                          style={{
                            margin:
                              "0 0 7px",
                            fontFamily:
                              '"DM Serif Display", Georgia, serif',
                            fontSize:
                              "23px",
                            lineHeight:
                              1.2,
                            fontWeight:
                              400,
                          }}
                        >
                          {
                            lecture.title
                          }
                        </h3>

                        {lecture.description && (
                          <p
                            style={{
                              margin:
                                0,
                              color:
                                "#876f67",
                              fontSize:
                                "14px",
                              lineHeight:
                                1.6,
                              display:
                                "-webkit-box",
                              WebkitLineClamp:
                                2,
                              WebkitBoxOrient:
                                "vertical",
                              overflow:
                                "hidden",
                            }}
                          >
                            {
                              lecture.description
                            }
                          </p>
                        )}

                        <div
                          style={{
                            marginTop:
                              "17px",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "space-between",
                            color:
                              "#e97817",
                            fontSize:
                              "13px",
                            fontWeight:
                              600,
                          }}
                        >
                          <span>
                            Watch lesson
                          </span>

                          <span>
                            →
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          )}
        </section>
      </main>

      <style jsx>{`
        button:hover {
          transform: translateY(-2px);
          box-shadow:
            0 16px 35px
            rgba(59, 23, 17, 0.1) !important;
        }

        @media (max-width: 760px) {
          main {
            width: calc(100% - 28px) !important;
            padding-top: 32px !important;
          }

          section:first-of-type {
            padding: 30px 25px !important;
          }
        }

        @media (max-width: 700px) {
          button {
            grid-template-columns: 1fr !important;
          }

          .lesson-card {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}