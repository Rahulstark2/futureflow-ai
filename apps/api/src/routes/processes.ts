import { Router, Request, Response } from "express";
import { z } from "zod";
import { processRepository } from "../repositories/processRepository";

export const processRouter = Router();

const CreateProcessBodySchema = z.object({
  name: z.string().min(1, "Name required"),
  industry: z.string().min(1, "Industry required"),
  description: z.string().min(1, "Description required"),
});

processRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const processes = await processRepository.findAll();
    return res.json({ success: true, data: processes });
  } catch (error) {
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
});

processRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const process = await processRepository.findById(id);
    if (!process) {
      return res.status(404).json({ success: false, error: "Process not found" });
    }
    return res.json({ success: true, data: process });
  } catch (error) {
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
});

processRouter.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = CreateProcessBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.format() });
    }
    const created = await processRepository.create(parsed.data);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
});

const UpdateProcessBodySchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  industry: z.string().min(1, "Industry cannot be empty").optional(),
  description: z.string().min(1, "Description cannot be empty").optional(),
});

processRouter.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = UpdateProcessBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.format() });
    }
    const updated = await processRepository.update(id, parsed.data);
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
});

processRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await processRepository.delete(id);
    return res.json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
});
