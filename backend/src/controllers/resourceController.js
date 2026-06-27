import Resource from "../models/Resource.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { listJSON, toJSON } from "../utils/mapper.js";

export const listResources = asyncHandler(async (_req, res) => {
  const resources = await Resource.find().sort({ type: 1 });
  res.json({ resources: listJSON(resources) });
});

export const createResource = asyncHandler(async (req, res) => {
  const quantity = Number(req.body.quantity);
  if (!req.body.type || !quantity || !req.body.unit) throw new ApiError(400, "Type, quantity, and unit are required");
  const resource = await Resource.create({
    type: req.body.type,
    quantity,
    available: quantity,
    distributed: 0,
    unit: req.body.unit,
    ngo: req.profile?._id
  });
  res.status(201).json({ resource: toJSON(resource) });
});

export const updateResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);
  if (!resource) throw new ApiError(404, "Resource not found");
  const amount = Number(req.body.amount || 0);
  if (amount <= 0) throw new ApiError(400, "Amount must be greater than zero");

  if (req.body.action === "add") {
    resource.quantity += amount;
    resource.available += amount;
  } else if (req.body.action === "distribute") {
    if (amount > resource.available) throw new ApiError(400, "Not enough available stock");
    resource.available -= amount;
    resource.distributed += amount;
  } else {
    throw new ApiError(400, "Invalid stock action");
  }

  await resource.save();
  res.json({ resource: toJSON(resource) });
});

export const deleteResource = asyncHandler(async (req, res) => {
  await Resource.findByIdAndDelete(req.params.id);
  res.status(204).end();
});
