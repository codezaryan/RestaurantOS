import { EstimatePrepTimeRequest } from "./ai.types";

export function validateEstimatePrepTime(
  request: EstimatePrepTimeRequest
): string | null {

  if (!Array.isArray(request.itemIds)) {
    return "itemIds must be an array.";
  }

  return null;
}