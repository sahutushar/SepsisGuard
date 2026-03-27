import { NextResponse } from "next/server";

// Demo users — replace with a real DB for production
const USERS: Record<string, string> = {
  doctor: "sepsis123",
  nurse:  "nurse456",
  admin:  "admin789",
};

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (USERS[username] && USERS[username] === password) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("session", username, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
      sameSite: "lax",
    });
    return res;
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("session");
  return res;
}
