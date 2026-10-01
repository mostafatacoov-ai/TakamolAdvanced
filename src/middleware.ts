import createMiddleware from 'next-intl/middleware';
import { routing } from './routing';

export default createMiddleware(routing);

export const config = {
  // the admin area and uploaded files aren't localised pages
  matcher: ['/((?!api|admin|media|_next|.*\\..*).*)']
};
