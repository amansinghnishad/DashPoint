export function getResponseData(responsePromise) {
  return responsePromise.then((response) => response.data);
}

export function compactParams(params = {}) {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      acc[key] = value;
    }
    return acc;
  }, {});
}
