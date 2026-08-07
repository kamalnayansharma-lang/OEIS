import { Request, Response } from "express";
import { fetchOeisSequence } from "../services/oeis.service";
import { processUserCode } from "../services/process.service";
import { OEISResponse, ProcessRequestBody } from "../types";

function sendError(res: Response, status: number, error: unknown, fallback: string): void {
  res.status(status).json({
    success: false,
    error: error instanceof Error ? error.message : fallback,
  });
}

export async function getSequence(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const oeisData = await fetchOeisSequence(id);

    res.json({
      success: true,
      sequenceId: id,
      oeisData,
    });
  } catch (error) {
    sendError(res, 502, error, "Failed to fetch OEIS data");
  }
}

export async function processSequence(req: Request, res: Response): Promise<void> {
  const { sequenceId, code } = req.body as ProcessRequestBody;

  if (!sequenceId || !code) {
    sendError(res, 400, null, "Both 'sequenceId' and 'code' are required");
    return;
  }

  let oeisData: OEISResponse;
  try {
    oeisData = await fetchOeisSequence(sequenceId);
  } catch (error) {
    sendError(res, 502, error, "Failed to fetch OEIS data");
    return;
  }

  try {
    const result = processUserCode(oeisData, code);

    res.json({
      success: true,
      sequenceId,
      oeisData,
      result,
    });
  } catch (error) {
    sendError(res, 400, error, "Failed to process sequence");
  }
}
