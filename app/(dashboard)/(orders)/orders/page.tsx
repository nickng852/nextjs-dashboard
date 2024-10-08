import { Suspense } from 'react'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { PlusIcon } from '@radix-ui/react-icons'

import OrderList from '@/app/(dashboard)/(orders)/components/order-list'
import { TableSkeleton } from '@/app/(dashboard)/(orders)/orders/components/skeletons'
import { Button } from '@/components/ui/button'

export default function Home() {
    const { userId } = auth()

    return (
        <main className="h-full flex-1 flex-col items-center md:flex">
            <div className="w-full max-w-5xl space-y-6 md:space-y-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Orders
                        </h2>
                        <p className="text-muted-foreground">
                            Here&apos;s a list of your orders.
                        </p>
                    </div>

                    <Link href="/orders/create">
                        <Button className="w-full">
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Order
                        </Button>
                    </Link>
                </div>

                <Suspense fallback={<TableSkeleton />}>
                    <OrderList userId={userId as string} />
                </Suspense>
            </div>
        </main>
    )
}
