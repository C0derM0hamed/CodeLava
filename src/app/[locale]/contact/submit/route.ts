import { nativeLead } from "@/components/sections/forms/native";

export async function POST(request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return nativeLead(request, "contact", locale);
}
