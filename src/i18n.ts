import {hasLocale} from 'next-intl';
import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
import {getMessagesFor} from './server/content';

export default getRequestConfig(async ({locale, requestLocale}) => {
  // `locale` is set when a caller passes one explicitly (e.g. generateMetadata)
  const requested = locale ?? (await requestLocale);
  const resolved = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale: resolved,
    // texts shipped in messages/*.json, with edits from the admin area applied
    messages: getMessagesFor(resolved)
  };
});
