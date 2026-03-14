export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('da-DK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('da-DK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('da-DK', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Lige nu'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min. siden`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} timer siden`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} dage siden`
  return formatDate(dateString)
}
