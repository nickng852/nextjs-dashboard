'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import ClickAwayListener from 'react-click-away-listener'
import { SketchPicker } from 'react-color'
import { useForm } from 'react-hook-form'
import { NumericFormat } from 'react-number-format'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeftIcon, ReloadIcon } from '@radix-ui/react-icons'

import {
    createProduct,
    editProduct,
} from '@/app/(dashboard)/(products)/lib/action'
import { formSchema } from '@/app/(dashboard)/(products)/lib/formSchema'
import { Product } from '@/app/(dashboard)/(products)/lib/type'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'

export default function ProductForm({
    editMode,
    product,
}: {
    editMode?: boolean
    product?: Product
}) {
    const params = useParams()
    const { toast } = useToast()
    const [colorPickerOpen, setColorPickerOpen] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: product ? product.name : '',
            description: product ? product.description ?? '' : '',
            price: product ? (product.price as string) : '',
            color: product ? (product.color as string) : '',
            image: undefined,
        },
    })

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        const formData = new FormData()

        Object.entries(data).forEach(([key, value]) => {
            if (value) {
                formData.append(key, value)
            }
        })

        return editMode
            ? edit(params.productId as string, formData)
            : create(formData)
    }

    const create = async (data: FormData) => {
        try {
            await createProduct(data)
            toast({
                description: 'Product created successfully.',
            })
        } catch (err) {
            console.log(err)
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description:
                    err instanceof Error
                        ? err.message
                        : 'An unknown error occurred',
            })
        }
    }

    const edit = async (productId: string, data: FormData) => {
        try {
            await editProduct(productId, data)
            toast({
                description: 'Product edited successfully.',
            })
        } catch (err) {
            console.log(err)
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description:
                    err instanceof Error
                        ? err.message
                        : 'An unknown error occurred',
            })
        }
    }

    return (
        <div className="w-full max-w-5xl space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/products">
                    <Button variant="outline" size="icon">
                        <ChevronLeftIcon className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Button>
                </Link>

                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {editMode ? 'Edit Product' : 'Create a new product'}
                    </h2>
                    <p className="text-muted-foreground">
                        {editMode
                            ? 'Edit your product in one-click.'
                            : 'Fill in the information below to add a new product to your store'}
                    </p>
                </div>
            </div>

            <div className="rounded-lg border p-4">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name*</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter Product Name"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter Product Description"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field: { value, ...fieldValues } }) => (
                                <FormItem>
                                    <FormLabel>Price*</FormLabel>
                                    <FormControl>
                                        <NumericFormat
                                            value={value}
                                            onValueChange={(v) => {
                                                if (v.floatValue) {
                                                    fieldValues.onChange(
                                                        v.floatValue.toString()
                                                    )
                                                } else {
                                                    fieldValues.onChange('')
                                                }
                                            }}
                                            prefix={'$'}
                                            thousandSeparator={true}
                                            customInput={Input}
                                            placeholder="Enter Product Price"
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field: { value, ...fieldValues } }) => (
                                <FormItem>
                                    <FormLabel>Color*</FormLabel>
                                    <div className="flex gap-3">
                                        <FormControl>
                                            <Input
                                                value={value}
                                                placeholder="Pick a color"
                                                readOnly
                                                {...fieldValues}
                                            />
                                        </FormControl>

                                        <Button
                                            variant="secondary"
                                            className="relative"
                                            onClick={(e) => {
                                                e.preventDefault()

                                                setColorPickerOpen(
                                                    !colorPickerOpen
                                                )
                                            }}
                                        >
                                            <div
                                                style={{
                                                    backgroundColor:
                                                        value ?? 'transparent',
                                                }}
                                                className="relative h-5 w-5 rounded-full"
                                            ></div>

                                            {colorPickerOpen && (
                                                <ClickAwayListener
                                                    onClickAway={() =>
                                                        setColorPickerOpen(
                                                            false
                                                        )
                                                    }
                                                >
                                                    <div
                                                        className="absolute -top-80 right-0 md:top-12"
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            e.stopPropagation()
                                                        }}
                                                    >
                                                        <SketchPicker
                                                            color={value}
                                                            onChange={(v) => {
                                                                if (v.hex) {
                                                                    fieldValues.onChange(
                                                                        v.hex
                                                                    )
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </ClickAwayListener>
                                            )}
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field: { value, ...fieldValues } }) => (
                                <FormItem>
                                    <FormLabel>Photo</FormLabel>

                                    {value && (
                                        <Image
                                            src={URL.createObjectURL(value)}
                                            alt={product?.name as string}
                                            className="rounded-lg"
                                            width={200}
                                            height={200}
                                            priority
                                        />
                                    )}

                                    {/* TODO: Add error image handling */}
                                    {!value && product?.imageUrl && (
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="rounded-lg"
                                            width={200}
                                            height={200}
                                            priority
                                            placeholder="blur"
                                            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO8dPVqPQAH+gL9EC8KowAAAABJRU5ErkJggg=="
                                        />
                                    )}

                                    <FormControl>
                                        <Input
                                            id="imageUrl"
                                            type="file"
                                            onChange={(e) =>
                                                fieldValues.onChange(
                                                    e.target.files?.[0]
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full md:w-auto"
                            disabled={
                                !form.formState.isDirty ||
                                form.formState.isSubmitting
                            }
                        >
                            {form.formState.isSubmitting && (
                                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {editMode ? 'Save' : 'Submit'}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
