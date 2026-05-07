export async function getAccessToken(): Promise<string | null> {
  const { accessToken } = await chrome.storage.session.get('accessToken');
  return typeof accessToken === 'string' ? accessToken : null;
}
