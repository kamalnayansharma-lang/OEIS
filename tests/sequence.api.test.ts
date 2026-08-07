import request from "supertest";

jest.mock("../src/services/oeis.service");
jest.mock("../src/services/process.service");

import { fetchOeisSequence } from "../src/services/oeis.service";
import { processUserCode } from "../src/services/process.service";
import app from "../src/app";

const mockedFetch = fetchOeisSequence as jest.MockedFunction<typeof fetchOeisSequence>;
const mockedProcess = processUserCode as jest.MockedFunction<typeof processUserCode>;

describe("GET /api/sequence/:id", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns the sequence data on success", async () => {
    const entries = [{ number: 55, data: "1,1,2", name: "Number of trees" }];
    mockedFetch.mockResolvedValueOnce(entries as never);

    const res = await request(app).get("/api/sequence/A000055");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      sequenceId: "A000055",
      oeisData: entries,
    });
    expect(mockedFetch).toHaveBeenCalledWith("A000055");
  });

  it("returns oeisData: null when the sequence does not exist", async () => {
    mockedFetch.mockResolvedValueOnce(null);

    const res = await request(app).get("/api/sequence/A99999999");

    expect(res.status).toBe(200);
    expect(res.body.oeisData).toBeNull();
  });

  it("returns 502 with an error message when the fetch fails", async () => {
    mockedFetch.mockRejectedValueOnce(new Error("upstream down"));

    const res = await request(app).get("/api/sequence/A000055");

    expect(res.status).toBe(502);
    expect(res.body).toEqual({ success: false, error: "upstream down" });
  });

  it("returns a generic error message when a non-Error is thrown", async () => {
    mockedFetch.mockRejectedValueOnce("not an Error instance");

    const res = await request(app).get("/api/sequence/A000055");

    expect(res.status).toBe(502);
    expect(res.body).toEqual({ success: false, error: "Failed to fetch OEIS data" });
  });
});

describe("POST /api/sequence/process", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when sequenceId is missing", async () => {
    const res = await request(app)
      .post("/api/sequence/process")
      .send({ code: "return 1;" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it("returns 400 when code is missing", async () => {
    const res = await request(app)
      .post("/api/sequence/process")
      .send({ sequenceId: "A000055" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 502 (not 400) when fetchOeisSequence fails", async () => {
    mockedFetch.mockRejectedValueOnce(new Error("upstream down"));

    const res = await request(app)
      .post("/api/sequence/process")
      .send({ sequenceId: "A000055", code: "return 1;" });

    expect(res.status).toBe(502);
    expect(res.body).toEqual({ success: false, error: "upstream down" });
    expect(mockedProcess).not.toHaveBeenCalled();
  });

  it("fetches the sequence, runs the user code, and returns the result", async () => {
    const entries = [{ number: 55, data: "1,1,2", name: "Number of trees" }];
    mockedFetch.mockResolvedValueOnce(entries as never);
    mockedProcess.mockReturnValueOnce("Number of trees");

    const res = await request(app)
      .post("/api/sequence/process")
      .send({ sequenceId: "A000055", code: "return oeisData[0].name;" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      sequenceId: "A000055",
      oeisData: entries,
      result: "Number of trees",
    });
    expect(mockedFetch).toHaveBeenCalledWith("A000055");
    expect(mockedProcess).toHaveBeenCalledWith(entries, "return oeisData[0].name;");
  });

  it("returns 400 with the error message when the user code throws", async () => {
    mockedFetch.mockResolvedValueOnce([] as never);
    mockedProcess.mockImplementationOnce(() => {
      throw new Error("bad user code");
    });

    const res = await request(app)
      .post("/api/sequence/process")
      .send({ sequenceId: "A000055", code: "throw new Error('bad user code');" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, error: "bad user code" });
  });

  it("returns a generic error message when a non-Error is thrown", async () => {
    mockedFetch.mockResolvedValueOnce([] as never);
    mockedProcess.mockImplementationOnce(() => {
      throw "not an Error instance";
    });

    const res = await request(app)
      .post("/api/sequence/process")
      .send({ sequenceId: "A000055", code: "throw 'nope';" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, error: "Failed to process sequence" });
  });
});

describe("app-level wiring", () => {
  it("serves the static UI", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("OEIS Sequence Explorer");
  });

  it("exposes CORS headers on a preflight request", async () => {
    const res = await request(app)
      .options("/api/sequence/process")
      .set("Origin", "http://localhost:5500")
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "content-type");

    expect(res.headers["access-control-allow-origin"]).toBeDefined();
  });
});
