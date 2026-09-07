import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  accessCookieName,
  hasValidAccessToken,
} from "@/lib/access";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(
    accessCookieName()
  )?.value;

  if (!hasValidAccessToken(token)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json(
      {
        error:
          "SUPABASE_SERVICE_ROLE_KEY is missing.",
      },
      { status: 500 }
    );
  }

  const supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: courses, error: courseError } =
    await supabase
      .from("courses")
      .select("id,title,description")
      .order("created_at", { ascending: true })
      .limit(1);

  if (courseError) {
    console.error(courseError);

    return NextResponse.json(
      { error: courseError.message },
      { status: 500 }
    );
  }

  if (!courses || courses.length === 0) {
    return NextResponse.json(
      { error: "No course exists yet." },
      { status: 404 }
    );
  }

  const course = courses[0];

  const {
    data: lectures,
    error: lectureError,
  } = await supabase
    .from("lectures")
    .select(
      "id,position,title,description,youtube_url"
    )
    .eq("course_id", course.id)
    .order("position", { ascending: true });

  if (lectureError) {
    console.error(lectureError);

    return NextResponse.json(
      { error: lectureError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    course,
    lectures: lectures || [],
  });
}