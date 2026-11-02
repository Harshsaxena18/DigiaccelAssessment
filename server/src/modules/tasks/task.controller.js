import { TaskService } from "./task.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export class TaskController {
  static createTask = asyncHandler(async (req, res) => {
    const task = await TaskService.createTask(req.body);
    res.status(201).json({ data: task });
  });

  static getTasks = asyncHandler(async (req, res) => {
    const { tasks, meta } = await TaskService.getTasks(req.query);
    res.status(200).json({ data: tasks, meta });
  });

  static getWeeklySummary = asyncHandler(async (req, res) => {
    const timezone = req.query.timezone || "UTC";
    const summary = await TaskService.getWeeklySummary(timezone);
    res.status(200).json({ data: summary });
  });

  static getTaskById = asyncHandler(async (req, res) => {
    const task = await TaskService.getTaskById(req.params.id);
    res.status(200).json({ data: task });
  });

  static updateTask = asyncHandler(async (req, res) => {
    const task = await TaskService.updateTask(req.params.id, req.body);
    res.status(200).json({ data: task });
  });

  static updateTaskStatus = asyncHandler(async (req, res) => {
    const task = await TaskService.updateTaskStatus(
      req.params.id,
      req.body.status
    );
    res.status(200).json({ data: task });
  });

  static deleteTask = asyncHandler(async (req, res) => {
    await TaskService.deleteTask(req.params.id);
    res.status(204).send();
  });
}
