
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { type ScheduleItem } from '@/types'
import { logger } from '@/utils/logger'

export default function Schedule() {
  const [items, setItems] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const { data, error } = await supabase
          .from('schedule')
          .select('*, course:course_id(*)')
          .order('date', { ascending: true })
        if (error) throw error
        setItems(data || [])
      } catch (err: any) {
        logger.error('Failed to fetch schedule:', err)
        setError(err.message || 'Failed to load schedule')
      } finally {
        setLoading(false)
      }
    }
    fetchSchedule()
  }, [])

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
        )}
      </div>
    </div>
  )
}
