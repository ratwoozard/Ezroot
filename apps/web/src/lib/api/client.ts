import createClient from 'openapi-fetch';
import type { paths } from '@ezroot/openapi/generated/schema';
import { config } from '@/lib/config';
import { getStoredToken } from '@/lib/auth/token';

export const api = createClient<paths>({ baseUrl: config.apiUrl });

api.use({
  onRequest({ request }) {
    const token = getStoredToken();
    if (token) request.headers.set('Authorization', `Bearer ${token}`);
    return request;
  },
});
