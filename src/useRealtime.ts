import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'


import type { QueryKey } from '@tanstack/react-query'
import { pb } from './pb'


export function usePocketBaseRealtime(
  collection: string,
  queryKey: QueryKey,
  enabled = true
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) {
      return
    }
    let unsubscribe: (() => void) | undefined
    let isCancelled = false

    pb.collection(collection)
      .subscribe('*', () => {
        queryClient.invalidateQueries({ queryKey })
      })
      .then((fn) => {
        if (isCancelled) {
          fn()
          return
        }
        unsubscribe = fn
      })

    return () => {
      isCancelled = true
      unsubscribe?.()
    }
  }, [collection, enabled, queryClient, queryKey])
}
