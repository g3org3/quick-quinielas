import { datadogLogs } from '@datadog/browser-logs';

datadogLogs.init({
  clientToken: 'pub03d7a670ab7bde1f02fceb5255680b02',
  site: 'datadoghq.eu',
  forwardErrorsToLogs: true,
  sessionSampleRate: 100,
});
