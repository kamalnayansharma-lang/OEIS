import vm from "vm";
import { OEISResponse } from "../types";

export function processUserCode(oeisData: OEISResponse, userCode: string): unknown {
  const sandbox = { oeisData, result: undefined as unknown };
  const context = vm.createContext(sandbox);

  const script = new vm.Script(`result = (function(oeisData) { ${userCode} })(oeisData);`);
  script.runInContext(context, { timeout: 1000 });

  return sandbox.result;
}
