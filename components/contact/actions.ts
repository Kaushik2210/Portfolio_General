"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { z } from "zod";
import { SITE } from "@/lib/data";
import { CONTACT_LIMIT, checkLimit, clientKey } from "@/lib/ratelimit";

export interface ContactState {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
  values?: { name: string; email: string; message: string };
}

const Schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please add your name.")
    .max(80, "That name is too long."),
  email: z.string().trim().email("That email address does not look right.").max(160),
  message: z
    .string()
    .trim()
    .min(10, "A few more words please (at least 10 characters).")
    .max(2000, "Please keep it under 2000 characters."),
});

const field = (fd: FormData, k: string) =>
  typeof fd.get(k) === "string" ? (fd.get(k) as string) : "";

export async function sendMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: real people never fill the hidden "website" field. Pretend success.
  if (field(formData, "website").trim() !== "") return { status: "ok" };

  const values = {
    name: field(formData, "name"),
    email: field(formData, "email"),
    message: field(formData, "message"),
  };

  const parsed = Schema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: NonNullable<ContactState["fieldErrors"]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as "name" | "email" | "message";
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", fieldErrors, values };
  }

  const limit = await checkLimit(clientKey(await headers()), CONTACT_LIMIT);
  if (!limit.ok) {
    return {
      status: "error",
      message: `You have sent a few messages already. Please try again in ${Math.ceil(limit.retryAfter / 60)} minutes, or email ${SITE.email}.`,
      values,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      status: "error",
      message: `The contact form is not switched on yet. Please email ${SITE.email} directly.`,
      values,
    };
  }

  const { name, email, message } = parsed.data;
  // Strip line breaks so a name can never inject extra mail headers.
  const safeName = name.replace(/[\r\n]+/g, " ");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
      to: process.env.CONTACT_TO_EMAIL || SITE.email,
      replyTo: email,
      subject: `Portfolio message from ${safeName}`,
      text: `From: ${safeName} <${email}>\n\n${message}`,
    });
    if (error) throw new Error(error.name);
  } catch {
    // Deliberately not logging the message body or the sender's address.
    return {
      status: "error",
      message: `Something went wrong sending that. Please email ${SITE.email} directly.`,
      values,
    };
  }

  return { status: "ok" };
}
