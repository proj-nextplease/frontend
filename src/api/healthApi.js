import { httpClient } from './httpClient.js';

export async function getApiHealth() {
  const response = await httpClient.get('/health');
  return response.data;
}
