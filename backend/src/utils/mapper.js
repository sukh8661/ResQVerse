function normalizeValue(value) {
  if (Array.isArray(value)) return value.map(normalizeValue);
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value.toHexString === "function") return value.toHexString();
  if (value && typeof value === "object") {
    if (value._id) return toJSON(value);
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeValue(item)]));
  }
  return value;
}

export function toJSON(document) {
  if (!document) return null;
  const object = typeof document.toObject === "function" ? document.toObject({ virtuals: true }) : document;
  const { _id, __v, ...rest } = object;
  delete rest.passwordHash;
  return {
    id: String(_id || object.id),
    ...Object.fromEntries(Object.entries(rest).map(([key, value]) => [key, normalizeValue(value)]))
  };
}

export function listJSON(documents) {
  return documents.map(toJSON);
}
