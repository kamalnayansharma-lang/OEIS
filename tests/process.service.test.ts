import { processUserCode } from "../src/services/process.service";

describe("processUserCode", () => {
  it("returns the value produced by the user's return statement", () => {
    const result = processUserCode(null, "return 1 + 1;");
    expect(result).toBe(2);
  });

  it("exposes oeisData to the user code", () => {
    const oeisData = [{ number: 55, data: "1,1,2", name: "Trees" }];
    const result = processUserCode(oeisData as never, "return oeisData[0].name;");
    expect(result).toBe("Trees");
  });

  it("returns undefined when the user code has no return statement", () => {
    const result = processUserCode(null, "const x = 1;");
    expect(result).toBeUndefined();
  });

  it("propagates exceptions thrown by the user code", () => {
    expect(() => processUserCode(null, "throw new Error('boom');")).toThrow("boom");
  });

  it("is isolated from the outer Node.js global scope", () => {
    const result = processUserCode(null, "return typeof process;");
    expect(result).toBe("undefined");
  });
});
