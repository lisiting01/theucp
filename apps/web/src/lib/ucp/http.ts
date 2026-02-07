import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "bad_request"
  | "not_found"
  | "conflict"
  | "forbidden"
  | "internal_error";

type ApiErrorOptions = {
  status?: number;
  details?: unknown;
};

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function fail(code: ApiErrorCode, message: string, options: ApiErrorOptions = {}) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details: options.details,
      },
    },
    { status: options.status ?? 400 },
  );
}

