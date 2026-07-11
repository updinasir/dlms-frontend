import { useState } from 'react'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'

export const ListRow = ({ avatar, image, title, subtitle }) => {
  const [imgError, setImgError] = useState(false)
  const showImage = image && !imgError

  return (
    <div className="flex items-center gap-3">
      {showImage ? (
        <img
          src={image}
          alt={title || 'Avatar'}
          className="h-10 w-10 rounded-full object-cover border border-slate-200"
          onError={() => setImgError(true)}
        />
      ) : (
        avatar && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
            {avatar}
          </div>
        )
      )}
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  )
}

const ListTable = ({ columns, data, keyExtractor, loading, emptyTitle, emptySubtitle, pagination, onPageChange }) => {
  return (
    <div className="rounded-[28px] border border-slate-200/70 bg-white shadow-sm overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Eye className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{emptyTitle || 'No records found'}</h3>
          <p className="mt-1 text-sm text-slate-500">{emptySubtitle || 'Try adjusting the filters.'}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="px-5 py-3.5">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((item) => (
                  <tr key={keyExtractor(item)} className="hover:bg-slate-50/50 transition">
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-3.5">
                        {col.render ? col.render(item) : col.accessor ? item[col.accessor] : null}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-slate-500">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ListTable
