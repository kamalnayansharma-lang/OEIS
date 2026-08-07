import axios from "axios";
import { fetchOeisSequence } from "../src/services/oeis.service";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("fetchOeisSequence", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns the response data when the sequence is found", async () => {
    const entries = [{ number: 55, data: "1,1,1,2", name: "Number of trees" }];
    mockedAxios.get.mockResolvedValueOnce({ data: entries });

    const result = await fetchOeisSequence("A000055");

    expect(result).toEqual(entries);
  });

  it("calls the OEIS search endpoint with the expected query params", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: null });

    await fetchOeisSequence("A000055");

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://oeis.org/search",
      expect.objectContaining({
        params: { fmt: "json", q: "id:A000055" },
      })
    );
  });

  it("returns null when no sequence matches", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: null });

    const result = await fetchOeisSequence("A99999999");

    expect(result).toBeNull();
  });

  it("propagates errors from the HTTP client", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("network down"));

    await expect(fetchOeisSequence("A000055")).rejects.toThrow("network down");
  });
});
