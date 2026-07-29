import type { Metadata } from "next";
import { InfoLayout, LegalBody } from "@/components/info-layout";
import { getLang } from "@/lib/get-lang";
import { getLegal } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms & Privacy",
  alternates: { canonical: "/terms" },
};

export default async function Page() {
  const t = getLegal(await getLang()).terms;
  return (
    <InfoLayout title={t.title} intro={t.intro}>
      <LegalBody sections={t.sections} />
    </InfoLayout>
  );
}
