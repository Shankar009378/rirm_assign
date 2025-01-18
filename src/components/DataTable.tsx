import React, { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, Search } from 'lucide-react';
import { DomainData } from '../types';
import Papa from 'papaparse';

const columnHelper = createColumnHelper<DomainData>();

const columns = [
  columnHelper.accessor('domain', {
    header: 'Domain',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('niche1', {
    header: 'Niche 1',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('niche2', {
    header: 'Niche 2',
    cell: (info) => info.getValue().toLocaleString(),
  }),
  columnHelper.accessor('traffic', {
    header: 'Traffic',
    cell: (info) => info.getValue().toLocaleString(),
  }),
  columnHelper.accessor('dr', {
    header: 'DR',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('da', {
    header: 'DA',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('language', {
    header: 'Language',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('price', {
    header: 'Price',
    cell: (info) => `$${info.getValue()}`,
  }),
  columnHelper.accessor('spamScore', {
    header: 'Spam Score',
    cell: (info) => `${info.getValue()}%`,
  }),
];

export function DataTable() {
  const [data, setData] = useState<DomainData[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://docs.google.com/spreadsheets/d/1vwc803C8MwWBMc7ntCre3zJ5xZtG881HKkxlIrwwxNs/gviz/tq?tqx=out:csv');
        const csvText = await response.text();
        const parsed = Papa.parse(csvText, { header: true }).data;

        const parsedData: DomainData[] = parsed.map((row: any) => ({
          domain: row['Domain'] || 'N/A',
          niche1: row['Niche 1'] || 'N/A',
          niche2: row['Niche 2'] || 'N/A',
          traffic: parseInt(row['Traffic'] || '0', 10),
          dr: parseFloat(row['DR'] || '0'),
          da: parseFloat(row['DA'] || '0'),
          language: row['Language'] || 'N/A',
          price: parseFloat(row['Price'] || '0'),
          spamScore: parseFloat(row['Spam Score'] || '0'),
        }));
        setData(parsedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: false
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5"
          placeholder="Search domains..."
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}