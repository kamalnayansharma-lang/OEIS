export interface OEISEntry {
  number: number;
  id?: string;
  data: string;
  name: string;
  [key: string]: unknown;
}

// The OEIS search API returns a bare JSON array of matching entries,
// or `null` when no sequence matches the query.
export type OEISResponse = OEISEntry[] | null;

export interface ProcessRequestBody {
  sequenceId: string;
  code: string;
}

export interface ProcessResponse {
  success: true;
  sequenceId: string;
  oeisData: OEISResponse;
  result: unknown;
}

export interface ErrorResponse {
  success: false;
  error: string;
}
