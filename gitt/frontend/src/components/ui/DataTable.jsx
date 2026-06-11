import {
  flexRender, getCoreRowModel, useReactTable
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({ data = [], columns, loading, pagination, onPageChange, emptyText = 'Sin datos' }) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th key={h.id} className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan={columns.length} className="text-center py-8 text-gray-500">Cargando...</td></tr>
            )}
            {!loading && data.length === 0 && (
              <tr><td colSpan={columns.length} className="text-center py-12 text-gray-500">{emptyText}</td></tr>
            )}
            {!loading && table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-gray-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Pagina {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
          </div>
          <div className="flex gap-1">
            <button onClick={() => onPageChange(pagination.page - 1)} disabled={pagination.page <= 1} className="btn-secondary disabled:opacity-50 px-2 py-1">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => onPageChange(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="btn-secondary disabled:opacity-50 px-2 py-1">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
