import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const COOKIE_NAME = "kalashala_access";
const SESSION_DAYS = 30;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase URL or anon key is missing from .env.local"
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function createAccessToken() {
  const secret = process.env.KALASHALA_ACCESS_SECRET;

  if (!secret) {
    throw new Error(
      "KALASHALA_ACCESS_SECRET is missing from .env.local"
    );
  }

  const expiresAt =
    Date.now() +
    SESSION_DAYS * 24 * 60 * 60 * 1000;

  const payload = String(expiresAt);

  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

function isValidAccessToken(token?: string) {
  if (!token) {
    return false;
  }

  const secret =
    process.env.KALASHALA_ACCESS_SECRET;

  if (!secret) {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return false;
  }

  const [expiresAtString, signature] = parts;

  const expiresAt = Number(expiresAtString);

  if (!Number.isFinite(expiresAt)) {
    return false;
  }

  if (Date.now() >= expiresAt) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(expiresAtString)
    .digest("hex");

  if (
    signature.length !==
    expectedSignature.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/*
 * Check whether the current browser already has
 * a valid Kalashala access session.
 */
export async function GET(
  request: NextRequest
) {
  const token =
    request.cookies.get(COOKIE_NAME)?.value;

  if (!isValidAccessToken(token)) {
    return NextResponse.json(
      {
        authenticated: false,
      },
      {
        status: 401,
      }
    );
  }

  return NextResponse.json({
    authenticated: true,
  });
}

/*
 * Verify the student course password.
 */
export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const password =
      typeof body?.password === "string"
        ? body.password.trim()
        : "";

    if (!password) {
      return NextResponse.json(
        {
          error:
            "Please enter the course password.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase = getSupabase();

    const {
      data,
      error,
    } = await supabase.rpc(
      "verify_course_password",
      {
        p_password: password,
      }
    );

    if (error) {
      console.error(
        "Supabase password verification error:",
        error
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    if (data !== true) {
      return NextResponse.json(
        {
          error:
            "Incorrect course password.",
        },
        {
          status: 401,
        }
      );
    }

    const token =
      createAccessToken();

    const response =
      NextResponse.json({
        success: true,
      });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge:
        SESSION_DAYS *
        24 *
        60 *
        60,
    });

    return response;
  } catch (error) {
    console.error(
      "Access route error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to verify password.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * Log the student out.
 */
export async function DELETE() {
  const response =
    NextResponse.json({
      success: true,
    });

  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}