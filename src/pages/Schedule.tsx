
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { type ScheduleItem } from '@/types'
import { logger } from '@/utils/logger'

export default function Schedule() {
  const [items, setItems] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10
  const [count, setCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchSchedule(currentPage: number) {
      try {
        const from = (currentPage - 1) * limit
        const to = currentPage * limit - 1
        const { data, error, count: total } = await supabase
          .from('schedule')
          .select('*, course:course_id(*)', {
            count: 'exact'
          })
          .order('date', { ascending: true })
          .range(from, to)
        if (error) throw error
        setItems(data || [])
        setCount(total ?? 0)
      } catch (err: any) {
        logger.error('Failed to fetch schedule', {
          component: 'Schedule',
          error: err
        })
        setError(err.message || 'Failed to load schedule')
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule(page)

    return () => controller.abort()
  }, [page])

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Tour Schedule</h1>
          <p className="card-description">
            View the complete itinerary for Portugal Golf Tour 2025
          </p>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-error">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No schedule items found.</p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-200">
              {items.map(item => (
                <li key={item.id} className="py-4 space-y-1">
                  <p className="font-medium">
                    {new Date(item.date).toLocaleDateString('en-GB')}
                  </p>
                  <p>{item.title}</p>
                  {item.course && (
                    <p className="text-sm text-gray-600">{item.course.name}</p>
                  )}
                </li>
              ))}
            </ul>
            {count > limit && (
              <div className="flex justify-between mt-4">
                <button
                  className="btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="self-center">
                  Page {page} of {Math.ceil(count / limit)}
                </span>
                <button
                  className="btn"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(count / limit)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
