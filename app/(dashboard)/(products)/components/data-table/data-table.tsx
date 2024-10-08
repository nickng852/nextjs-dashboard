'use client'
import { useState, useCallback, useTransition } from 'react'
import _ from 'lodash'
import { Loader2Icon } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    ColumnFiltersState,
    VisibilityState,
    getSortedRowModel,
    SortingState,
    getPaginationRowModel,
    PaginationState,
    useReactTable,
} from '@tanstack/react-table'

import { DataTablePagination } from '@/app/(dashboard)/(products)/components/data-table/data-table-pagination'
import { Product } from '@/app/(dashboard)/(products)/lib/type'
import { Input } from '@/components/input-with-spinner'
// import {
//     Pagination,
//     PaginationContent,
//     PaginationEllipsis,
//     PaginationItem,
//     PaginationLink,
//     PaginationNext,
//     PaginationPrevious,
// } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<Product, TValue>[]
    data: Product[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set(name, value)

            return params.toString()
        },
        [searchParams]
    )

    const handleSearch = (name: string, value: string) => {
        const params = createQueryString(name, value)

        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`)
            table.getColumn('name')?.setFilterValue(value)
        })
    }

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {}
    )
    const [sorting, setSorting] = useState<SortingState>([])
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onPaginationChange: setPagination,
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            columnFilters,
            columnVisibility,
            sorting,
            pagination,
        },
    })

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Filter products..."
                    onChange={(e) => handleSearch('q', e.target.value)}
                    loading={isPending}
                    endIcon={Loader2Icon}
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            <MixerHorizontalIcon className="h-4 w-4 md:mr-2" />
                            <p className="hidden md:block">View</p>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[150px]">
                        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {_.startCase(column.id)}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                    onDoubleClick={() => {
                                        router.push(
                                            `/product/${row.original?.id}/edit`
                                        )
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* <Pagination>
                <PaginationContent>
                    <PaginationItem
                        onClick={() => {
                            if (table.getCanPreviousPage()) {
                                table.previousPage()
                            }
                        }}
                    >
                        <PaginationPrevious
                            className={
                                !table.getCanPreviousPage()
                                    ? 'pointer-events-none opacity-50'
                                    : 'cursor-pointer'
                            }
                        />
                    </PaginationItem>
                    {[...new Array(table.getPageCount())].map((page, index) => {
                        return (
                            <PaginationItem
                                key={index}
                                className={
                                    index !== 0 ? 'cursor-pointer' : undefined
                                }
                            >
                                <PaginationLink
                                    onClick={() => table.setPageIndex(index)}
                                    isActive={
                                        table.getState().pagination
                                            .pageIndex === index
                                    }
                                >
                                    {index + 1}
                                </PaginationLink>
                            </PaginationItem>
                        )
                    })}
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem
                        onClick={() => {
                            if (table.getCanNextPage()) {
                                table.nextPage()
                            }
                        }}
                    >
                        <PaginationNext
                            className={
                                !table.getCanNextPage()
                                    ? 'pointer-events-none opacity-50'
                                    : 'cursor-pointer'
                            }
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination> */}

            <DataTablePagination table={table} />
        </div>
    )
}
