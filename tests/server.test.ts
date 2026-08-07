jest.mock("../src/app", () => ({
  __esModule: true,
  default: { listen: jest.fn() },
}));

describe("server bootstrap", () => {
  const originalPort = process.env.PORT;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env.PORT = originalPort;
    consoleLogSpy.mockRestore();
  });

  it("listens on process.env.PORT when set", () => {
    process.env.PORT = "5000";

    const app = require("../src/app").default;
    require("../src/server");

    expect(app.listen).toHaveBeenCalledWith("5000", expect.any(Function));

    const callback = (app.listen as jest.Mock).mock.calls[0][1];
    callback();
    expect(consoleLogSpy).toHaveBeenCalledWith("Server running on port 5000");
  });

  it("falls back to port 3000 when PORT is not set", () => {
    delete process.env.PORT;

    const app = require("../src/app").default;
    require("../src/server");

    expect(app.listen).toHaveBeenCalledWith(3000, expect.any(Function));
  });
});
