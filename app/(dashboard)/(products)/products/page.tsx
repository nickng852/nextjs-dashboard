import { Suspense } from 'react'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { PlusIcon } from '@radix-ui/react-icons'

import ProductList from '@/app/(dashboard)/(products)/components/product-list'
import { Button } from '@/components/ui/button'

import { TableSkeleton } from './components/skeletons'

export default function Home({
    searchParams,
}: {
    searchParams: { q: string }
}) {
    const { userId } = auth()

    return (
        <main className="h-full flex-1 flex-col items-center md:flex">
            <div className="w-full max-w-5xl space-y-6 md:space-y-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Products
                        </h2>
                        <p className="text-muted-foreground">
                            Here&apos;s a list of your products.
                        </p>
                    </div>

                    <Link href="/products/create">
                        <Button className="w-full">
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Product
                        </Button>
                    </Link>
                </div>

                <Suspense fallback={<TableSkeleton />}>
                    <ProductList
                        searchParams={searchParams}
                        userId={userId as string}
                    />
                </Suspense>
            </div>
        </main>
    )
}
