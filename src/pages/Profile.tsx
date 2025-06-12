import { useState, type FormEvent, type ChangeEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    handicap: user?.handicap || 18
  })

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await updateProfile(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess('Profile updated successfully!')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Profile Settings</h1>
          <p className="card-description">
            Update your personal information and golf handicap
          </p>
        </div>

        {success && (
          <div className="bg-success bg-opacity-10 border border-success text-success px-4 py-3 rounded-md mb-6">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-error bg-opacity-10 border border-error text-error px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="first_name" className="form-label">
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                className="form-input"
                value={formData.first_name}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name" className="form-label">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                className="form-input"
                value={formData.last_name}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="handicap" className="form-label">
              Handicap Index
            </label>
            <input
              id="handicap"
              name="handicap"
              type="number"
              min="0"
              max="54"
              step="0.1"
              required
              className="form-input"
              value={formData.handicap}
              onChange={handleInputChange}
            />
            <p className="form-help">
              Your current handicap index (0-54). This is used for scorecard calculations.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-900 mb-2">Account Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium capitalize">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member since:</span>
                <span className="font-medium">
                  {new Date(user.created_at).toLocaleDateString('en-GB')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setFormData({
                  first_name: user.first_name,
                  last_name: user.last_name,
                  handicap: user.handicap
                })
                setError('')
                setSuccess('')
              }}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}