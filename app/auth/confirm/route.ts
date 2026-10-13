import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// The email link lands here: {{ .SiteURL }}/auth/confirm?token_hash=…&type=email&next=/assets/new
// Verifying the token hash (rather than a PKCE code) works even when the link
// is opened on a different device from the one that requested it.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const next = params.get("next") ?? "/assets/new";
  // Only allow redirects to paths on this site.
  const destination = next.startsWith("/") && !next.startsWith("//") ? next : "/assets/new";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }
  return NextResponse.redirect(new URL("/assets/new?link=invalid", request.url));
}
