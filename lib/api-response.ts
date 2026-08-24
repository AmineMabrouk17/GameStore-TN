import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export type ApiErrorDetails = Record<string, string[]>;

export function jsonOk(data: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export function jsonError(
  message: string,
  status: number,
  details?: ApiErrorDetails
): NextResponse {
  return NextResponse.json(
    details ? { error: message, details } : { error: message },
    { status }
  );
}

export function zodErrorDetails(error: ZodError): ApiErrorDetails {
  const details: ApiErrorDetails = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.map(String).join(".") : "_";
    const messages = details[key] ?? [];
    messages.push(issue.message);
    details[key] = messages;
  }
  return details;
}

export function invalidJsonBodyResponse(): NextResponse {
  return jsonError("Request body must be valid JSON", 400);
}

export function invalidBodyResponse(error: ZodError): NextResponse {
  return jsonError("Invalid request body", 400, zodErrorDetails(error));
}

export async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
