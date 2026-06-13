import posthog from 'posthog-js'

import { pb } from '@/pb'

const key = import.meta.env.VITE_POSTHOG_KEY

if (key) {
  posthog.init(key, {
    api_host: 'https://eu.i.posthog.com',
    defaults: '2025-05-24',
    capture_exceptions: true,
  })

  if (pb.authStore.isValid && pb.authStore.model) {
    const { id, email, name } = pb.authStore.model
    posthog.identify(id, { email, name })
  }
}

export { posthog }
