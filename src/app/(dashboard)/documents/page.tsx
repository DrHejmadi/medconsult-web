'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Document } from '@/lib/types/database'

const CATEGORIES = ['CV', 'Certifikater', 'Forsikring', 'Autorisation', 'Andet'] as const
type DocumentCategory = typeof CATEGORIES[number]

const FILE_TYPE_ICONS: Record<string, string> = {
  'application/pdf': '📕',
  'image/png': '🖼️',
  'image/jpeg': '🖼️',
  'image/jpg': '🖼️',
  'application/msword': '📘',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📘',
  'default': '📄',
}

function getFileIcon(fileType: string): string {
  return FILE_TYPE_ICONS[fileType] || FILE_TYPE_ICONS['default']
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('da-DK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('CV')
  const [filterCategory, setFilterCategory] = useState<DocumentCategory | 'Alle'>('Alle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  async function fetchDocuments() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false })

    if (fetchError) {
      setError('Kunne ikke hente dokumenter: ' + fetchError.message)
    } else {
      setDocuments((data as Document[]) || [])
    }
    setLoading(false)
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) {
      setError('Kunne ikke uploade fil: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    const { error: insertError } = await supabase.from('documents').insert({
      user_id: user.id,
      name: file.name,
      file_url: urlData.publicUrl,
      file_size: file.size,
      file_type: file.type,
      category: selectedCategory,
    })

    if (insertError) {
      setError('Kunne ikke gemme dokument: ' + insertError.message)
    } else {
      await fetchDocuments()
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleDelete(doc: Document) {
    if (!confirm(`Er du sikker pa, at du vil slette "${doc.name}"?`)) return

    const supabase = createClient()

    // Extract file path from URL
    const urlParts = doc.file_url.split('/documents/')
    const filePath = urlParts[urlParts.length - 1]

    await supabase.storage.from('documents').remove([filePath])
    const { error: deleteError } = await supabase.from('documents').delete().eq('id', doc.id)

    if (deleteError) {
      setError('Kunne ikke slette dokument: ' + deleteError.message)
    } else {
      setDocuments(documents.filter((d) => d.id !== doc.id))
    }
  }

  const filteredDocuments = filterCategory === 'Alle'
    ? documents
    : documents.filter((d) => d.category === filterCategory)

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dokumenter</h1>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
      )}

      {/* Upload section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Upload dokument</h2>
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory)}
              className="block rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fil</label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleUpload}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="block text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {uploading && (
            <span className="text-sm text-gray-500">Uploader...</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Accepterede formater: PDF, Word, PNG, JPG. Brug kategorierne til at organisere dine dokumenter (CV, certifikater som ALS/ATLS, forsikring, autorisation m.m.)
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilterCategory('Alle')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterCategory === 'Alle' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Alle
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterCategory === cat ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Documents grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Indlaeser dokumenter...</div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {filterCategory === 'Alle' ? 'Ingen dokumenter endnu. Upload dit forste dokument ovenfor.' : `Ingen dokumenter i kategorien "${filterCategory}".`}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-3xl">{getFileIcon(doc.file_type)}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(doc.file_size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc)}
                  className="text-gray-400 hover:text-red-500 text-sm ml-2 shrink-0"
                  title="Slet dokument"
                >
                  Slet
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {doc.category}
                </span>
                <span className="text-xs text-gray-400">{formatDate(doc.uploaded_at)}</span>
              </div>
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-center text-sm text-blue-600 hover:underline"
              >
                Abn fil
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
