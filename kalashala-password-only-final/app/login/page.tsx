"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanPassword = password.trim();

    if (!cleanPassword) {
      setError("Please enter the course password.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/access", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: cleanPassword,
        }),
      });

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const text = await response.text();

        console.error(
          "Non-JSON response from /api/access:",
          response.status,
          text
        );

        setError(
          `Server returned ${response.status}.`
        );

        setBusy(false);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.error ||
            "Incorrect course password."
        );

        setBusy(false);
        return;
      }

      router.replace("/dashboard");
    } catch (err) {
      console.error(
        "Student login error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect."
      );

      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link href="/">
          <img
            className="auth-logo"
            src="/kalashala-logo.jpg"
            alt="Kalashala"
          />
        </Link>

        <h1>Student login</h1>

        <p className="sub">
          Enter the password provided by
          Kalashala.
        </p>

        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="password">
              Course password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={busy}
          >
            {busy
              ? "Opening course…"
              : "Enter course"}
          </button>
        </form>

        {error && (
          <div className="message error">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}