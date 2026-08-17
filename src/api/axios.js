export function attachBearerToken(headers = {}, token) {
  return {
    ...headers,
    Authorization: token ? `Bearer ${token}` : undefined,
  };
}

export function createSecureRequest(token, endpoint) {
  return {
    endpoint,
    headers: attachBearerToken({}, token),
  };
}
