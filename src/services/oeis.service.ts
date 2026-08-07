import axios from "axios";
import { OEISResponse } from "../types";

const OEIS_BASE_URL = "https://oeis.org/search";

export async function fetchOeisSequence(sequenceId: string): Promise<OEISResponse> {
  const response = await axios.get<OEISResponse>(OEIS_BASE_URL, {
    params: {
      fmt: "json",
      q: `id:${sequenceId}`,
    },
  });

  return response.data;
}
