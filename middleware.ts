import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { normalizeRole } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";

function requiredRoleForPath(pathname: string) {
  if (pathname.startsWith("/crm")) {
    return "operator" as const;
  }

  if (pathname.startsWith("/admin")) {
    return "admin" as const;
  }

  if (pathname.startsWith("/cabinet")) {
    return "pilgrim" as const;
  }

  return null;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const requiredRole = requiredRoleForPath(request.nextUrl.pathname);

  if (!requiredRole || !isSupabaseConfigured()) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          cookiesToSet.forEach(({ name, value }) => {
            if (name) {
              request.cookies.set(name, value);
            }
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            if (name) {
              response.cookies.set(name, value, options);
            }
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  let role = normalizeRole(user.app_metadata?.role ?? user.user_metadata?.role);

  if (!role) {
    const [{ data: operator }, { data: pilgrim }] = await Promise.all([
      supabase.from("operators").select("id").eq("user_id", user.id).maybeSingle(),
      supabase.from("pilgrim_profiles").select("id").eq("user_id", user.id).maybeSingle(),
    ]);

    role = operator ? "operator" : pilgrim ? "pilgrim" : null;
  }

  if (role !== requiredRole) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
