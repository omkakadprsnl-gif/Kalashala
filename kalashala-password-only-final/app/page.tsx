"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#faf7f2",
        color: "#3b1711",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <header
        style={{
          height: "74px",
          borderBottom: "1px solid #e5d9ce",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          background: "#faf7f2",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
            color: "#3b1711",
          }}
        >
          <img
            src="/kalashala-logo.jpg"
            alt="Kalashala"
            style={{
              width: "48px",
              height: "48px",
              objectFit: "contain",
            }}
          />

          <span
            style={{
              fontFamily:
                '"DM Serif Display", Georgia, serif',
              fontSize: "27px",
            }}
          >
            Kalashala
          </span>
        </Link>

        <Link
          href="/login"
          style={{
            color: "#3b1711",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Student login
        </Link>
      </header>

      <section
        style={{
          width:
            "min(calc(100% - 40px), 1080px)",
          margin: "0 auto",
          padding:
            "90px 0 110px",
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "70px",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              color: "#e97817",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing:
                "0.22em",
              textTransform:
                "uppercase",
              marginBottom: "16px",
            }}
          >
            कला · कौशल · आत्मनिर्भरता
          </div>

          <h1
            style={{
              margin: 0,
              fontFamily:
                '"DM Serif Display", Georgia, serif',
              fontWeight: 400,
              fontSize:
                "clamp(46px, 6vw, 72px)",
              lineHeight: 1.05,
            }}
          >
            Learn embroidery
            <br />
            the way it is
            <br />
            actually taught.
          </h1>

          <p
            style={{
              margin:
                "24px 0 32px",
              maxWidth: "570px",
              color: "#876f67",
              fontSize: "18px",
              lineHeight: 1.75,
            }}
          >
            Step-by-step embroidery lessons
            taught through clear,
            practical video demonstrations.
            Learn at your own pace from
            your phone or computer.
          </p>

          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "48px",
              padding:
                "0 24px",
              borderRadius: "10px",
              background:
                "#3b1711",
              color: "#fff",
              textDecoration:
                "none",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Enter course →
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent:
              "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              padding:
                "35px",
              background: "#fff",
              border:
                "1px solid #e5d9ce",
              borderRadius:
                "18px",
            }}
          >
            <img
              src="/kalashala-logo.jpg"
              alt="Kalashala"
              style={{
                width: "100%",
                maxWidth: "390px",
                height: "auto",
                margin:
                  "0 auto",
                objectFit:
                  "contain",
              }}
            />
          </div>
        </div>
      </section>

      <footer
        style={{
          borderTop:
            "1px solid #e5d9ce",
          padding:
            "24px 32px",
          textAlign: "center",
          color: "#876f67",
          fontSize: "13px",
        }}
      >
        Kalashala
      </footer>
    </main>
  );
}