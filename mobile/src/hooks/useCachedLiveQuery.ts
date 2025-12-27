import { useEffect, useState, useRef } from 'react'
import { useLiveQuery } from '@tanstack/react-db'
import { mmkvStorage } from '@/src/lib/storage/mmkv'

type UseCachedLiveQueryResult<T> = {
  data: T[]
  isLoading: boolean
  isFromCache: boolean
}

export function useCachedLiveQuery<T>(
  cacheKey: string,
  queryFn: (q: any) => any,
  deps: any[] = []
): UseCachedLiveQueryResult<T> {
  const [data, setData] = useState<T[]>(() => {
    const cached = mmkvStorage.getItem<T[]>(cacheKey)
    return cached ?? []
  })
  const [isFromCache, setIsFromCache] = useState(true)
  const hasReceivedDbData = useRef(false)
  const lastDataHash = useRef<string>('')

  const liveQueryResult = useLiveQuery(queryFn, deps) ?? { data: [] }
  const dbData = (liveQueryResult.data ?? []) as T[]

  useEffect(() => {
    if (dbData.length > 0) {
      const dataHash = JSON.stringify(dbData)

      if (dataHash !== lastDataHash.current) {
        lastDataHash.current = dataHash
        setData(dbData)
        mmkvStorage.setItem(cacheKey, dbData)

        if (!hasReceivedDbData.current) {
          hasReceivedDbData.current = true
          setIsFromCache(false)
        }
      }
    }
  }, [dbData, cacheKey])

  const isLoading = data.length === 0 && !hasReceivedDbData.current

  return {
    data,
    isLoading,
    isFromCache: isFromCache && data.length > 0
  }
}
