import { Request, Response } from "express";
import { fetchOeisSequence } from "../services/oeis.service";
import { processUserCode } from "../services/process.service";
import { ProcessRequestBody } from "../types";

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
    res.status(502).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch OEIS data",
    });
  }
}

export async function processSequence(req: Request, res: Response): Promise<void> {
  try {
    const { sequenceId, code } = req.body as ProcessRequestBody;

    if (!sequenceId || !code) {
      res.status(400).json({
        success: false,
        error: "Both 'sequenceId' and 'code' are required",
      });
      return;
    }

    const oeisData = await fetchOeisSequence(sequenceId);
    const result = processUserCode(oeisData, code);

    res.json({
      success: true,
      sequenceId,
      oeisData,
      result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to process sequence",
    });
  }
}
