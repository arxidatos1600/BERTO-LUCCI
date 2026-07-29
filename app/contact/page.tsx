"use client";

import * as React from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { InfoLayout, InfoSection } from "@/components/info-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const [sent, setSent] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const subject = encodeURIComponent(`Website enquiry from ${form.get("name")}`);
    const body = encodeURIComponent(
      `Name: ${form.get("name")}\nEmail: ${form.get("email")}\nPhone: ${form.get("phone")}\n\n${form.get("message")}`
    );
    // Hand off to the customer's email client addressed to Berto Lucci.
    window.location.href = `mailto:info@bertolucci.com.gr?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <InfoLayout
      title="Contact"
      intro="Call us for a phone order or customer service, or send us a message. We are here to help."
    >
      {/* Contact details */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2">
        {[
          { icon: Phone, label: "Phone", value: "+30 210 524 6634" },
          { icon: Mail, label: "Email", value: "info@bertolucci.com.gr" },
          { icon: MapPin, label: "Address", value: "28is Oktovriou 9, Athens 104 32" },
          { icon: Clock, label: "Opening hours", value: "Monday–Friday · 09:00–17:00" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3 border border-border bg-card p-5">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <p className="eyebrow">{label}</p>
              <p className="mt-1 text-sm">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <InfoSection title="Send us a message">
        {sent ? (
          <p role="status" className="border border-border bg-secondary/40 p-4 text-sm">
            Thank you. Your message has been prepared in your email app, and we will get back to
            you as soon as possible.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <Label htmlFor="name" className="mb-1.5 block text-xs uppercase tracking-luxe">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="sm:col-span-1">
              <Label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-luxe">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="phone" className="mb-1.5 block text-xs uppercase tracking-luxe">Phone number</Label>
              <Input id="phone" name="phone" type="tel" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="message" className="mb-1.5 block text-xs uppercase tracking-luxe">Comment</Label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="flex w-full border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" variant="accent" size="lg">Send Message</Button>
            </div>
          </form>
        )}
      </InfoSection>

      {/* Legal company details */}
      <InfoSection title="Company details">
        <p>
          The Berto Lucci online store is operated by:
        </p>
        <ul>
          <li><strong>Company:</strong> BLUE BELL S.A. (AEBE)</li>
          <li><strong>Headquarters:</strong> 37 Ermou Street, Athens, 105 63</li>
          <li><strong>VAT number:</strong> 999640058 · Tax Office: KEFODE Attica</li>
          <li><strong>General Commercial Registry (GEMI):</strong> 004853001000</li>
        </ul>
      </InfoSection>
    </InfoLayout>
  );
}
