a complete CRUD Starter Kit you can directly copy into your dashboard project and then reuse across Customers, Invoices, Shipments, Inventory, Manifests, Warehouses, Staff, etc.

I’m going to give you:

✅ Reusable CRUD system (Table + Dialog + Delete Confirmation)

✅ Supabase server-actions pattern (create/read/update/delete)

✅ Full working example for Customers CRUD module

✅ A repeatable pattern to implement CRUD for ALL other pages quickly

A) Install Required Dependencies

Run:

npm i @tanstack/react-table zod react-hook-form @hookform/resolvers


(Assuming shadcn/ui is already installed.)

B) Folder Structure (Recommended)
src/
  app/
    dashboard/
      customers/
        page.tsx
        CustomersClient.tsx
        customers.columns.tsx
        customers.schema.ts
  actions/
    customers.actions.ts
  components/
    crud/
      CrudTable.tsx
      CrudRowActions.tsx
      CrudUpsertDialog.tsx
      CrudDeleteDialog.tsx
  lib/
    supabase/
      server.ts
      client.ts

C) Supabase Setup
1) src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore if called from RSC
          }
        },
      },
    }
  );
}

2) src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

D) Create Database Table (Supabase SQL)

Create customers table:

create extension if not exists "uuid-ossp";

create table if not exists public.customers (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  name text not null,
  phone text,
  email text,
  address text,

  is_active boolean default true
);

create index if not exists customers_name_idx on public.customers using gin (to_tsvector('english', name));


✅ Optionally enforce phone uniqueness if needed later.

E) Zod Schema (Customers)
src/app/dashboard/customers/customers.schema.ts
import { z } from "zod";

export const customerUpsertSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
});

export type CustomerUpsertInput = z.infer<typeof customerUpsertSchema>;

export type CustomerRow = {
  id: string;
  created_at: string;
  updated_at: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
};

F) Server Actions CRUD (Customers)
src/actions/customers.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { customerUpsertSchema, CustomerUpsertInput } from "@/app/dashboard/customers/customers.schema";

export async function getCustomers(params?: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const supabase = createSupabaseServerClient();

  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (params?.search?.trim()) {
    query = query.ilike("name", `%${params.search.trim()}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw new Error(error.message);

  return {
    rows: data ?? [],
    count: count ?? 0,
    page,
    pageSize,
  };
}

export async function createCustomer(input: CustomerUpsertInput) {
  const supabase = createSupabaseServerClient();
  const parsed = customerUpsertSchema.parse(input);

  const { error } = await supabase.from("customers").insert({
    ...parsed,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/customers");
  return { ok: true };
}

export async function updateCustomer(customerId: string, input: CustomerUpsertInput) {
  const supabase = createSupabaseServerClient();
  const parsed = customerUpsertSchema.parse(input);

  const { error } = await supabase
    .from("customers")
    .update({
      ...parsed,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/customers");
  return { ok: true };
}

export async function deleteCustomer(customerId: string) {
  const supabase = createSupabaseServerClient();

  // Soft delete (recommended)
  const { error } = await supabase
    .from("customers")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", customerId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/customers");
  return { ok: true };
}

G) Reusable CRUD Components
1) src/components/crud/CrudRowActions.tsx
"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CrudRowActions(props: {
  onEdit: () => void;
  onDelete: () => void;
  extraItems?: { label: string; onClick: () => void }[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={props.onEdit}>Edit</DropdownMenuItem>
        {props.extraItems?.map((item) => (
          <DropdownMenuItem key={item.label} onClick={item.onClick}>
            {item.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem className="text-destructive" onClick={props.onDelete}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

2) src/components/crud/CrudDeleteDialog.tsx
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function CrudDeleteDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => Promise<void> | void;
  confirmLabel?: string;
}) {
  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title ?? "Delete item?"}</AlertDialogTitle>
          <AlertDialogDescription>
            {props.description ?? "This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => props.onConfirm()}>
            {props.confirmLabel ?? "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

3) src/components/crud/CrudUpsertDialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function CrudUpsertDialog<TSchema extends z.ZodTypeAny>(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  title: string;
  schema: TSchema;
  defaultValues: z.infer<TSchema>;
  onSubmit: (values: z.infer<TSchema>) => Promise<void>;
}) {
  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(props.schema),
    defaultValues: props.defaultValues,
  });

  useEffect(() => {
    if (props.open) {
      form.reset(props.defaultValues);
    }
  }, [props.open]);

  async function submit(values: z.infer<TSchema>) {
    await props.onSubmit(values);
    props.onOpenChange(false);
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
            {/* Minimal generic fields - you can customize per entity */}
            <FormField
              control={form.control}
              name={"name" as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={"phone" as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={"email" as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={"address" as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Address" className="min-h-[90px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {props.mode === "create" ? "Create" : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


✅ This version is a “starter” dialog. For other pages (Invoices, Shipments), we’ll create dedicated forms, but the same dialog logic stays.

4) src/components/crud/CrudTable.tsx
"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function CrudTable<TData>(props: {
  columns: ColumnDef<TData, any>[];
  data: TData[];
}) {
  const table = useReactTable({
    data: props.data,
    columns: props.columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-xl border overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={props.columns.length} className="h-24 text-center text-muted-foreground">
                No data found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

H) Customers Page Implementation (Full CRUD)
1) src/app/dashboard/customers/customers.columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CustomerRow } from "./customers.schema";
import { CrudRowActions } from "@/components/crud/CrudRowActions";
import { Badge } from "@/components/ui/badge";

export function getCustomersColumns(params: {
  onEdit: (row: CustomerRow) => void;
  onDelete: (row: CustomerRow) => void;
}): ColumnDef<CustomerRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.phone ?? "—"}</div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email ?? "—",
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <span className="line-clamp-1 text-muted-foreground">
          {row.original.address ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) =>
        row.original.is_active ? (
          <Badge variant="secondary">Active</Badge>
        ) : (
          <Badge variant="outline">Inactive</Badge>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <CrudRowActions
          onEdit={() => params.onEdit(row.original)}
          onDelete={() => params.onDelete(row.original)}
        />
      ),
    },
  ];
}

2) src/app/dashboard/customers/CustomersClient.tsx
"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CrudTable } from "@/components/crud/CrudTable";
import { CrudUpsertDialog } from "@/components/crud/CrudUpsertDialog";
import { CrudDeleteDialog } from "@/components/crud/CrudDeleteDialog";

import { createCustomer, deleteCustomer, updateCustomer } from "@/actions/customers.actions";
import { customerUpsertSchema, CustomerRow, CustomerUpsertInput } from "./customers.schema";
import { getCustomersColumns } from "./customers.columns";

import { useToast } from "@/hooks/use-toast";

export default function CustomersClient(props: {
  rows: CustomerRow[];
}) {
  const { toast } = useToast();

  const [search, setSearch] = useState("");

  const [upsertOpen, setUpsertOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [activeRow, setActiveRow] = useState<CustomerRow | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<CustomerRow | null>(null);

  const filteredRows = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return props.rows;
    return props.rows.filter((r) => r.name.toLowerCase().includes(s));
  }, [search, props.rows]);

  const columns = useMemo(() => {
    return getCustomersColumns({
      onEdit: (row) => {
        setMode("edit");
        setActiveRow(row);
        setUpsertOpen(true);
      },
      onDelete: (row) => {
        setRowToDelete(row);
        setDeleteOpen(true);
      },
    });
  }, []);

  async function handleUpsert(values: CustomerUpsertInput) {
    try {
      if (mode === "create") {
        await createCustomer(values);
        toast({ title: "Customer created successfully." });
      } else {
        if (!activeRow) return;
        await updateCustomer(activeRow.id, values);
        toast({ title: "Customer updated successfully." });
      }
    } catch (err: any) {
      toast({
        title: "Operation failed",
        description: err?.message ?? "Something went wrong",
        variant: "destructive",
      });
    }
  }

  async function handleDelete() {
    if (!rowToDelete) return;

    try {
      await deleteCustomer(rowToDelete.id);
      toast({ title: "Customer deleted successfully." });
      setRowToDelete(null);
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err?.message ?? "Something went wrong",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full gap-2 sm:max-w-md">
          <Input
            placeholder="Search customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button
          onClick={() => {
            setMode("create");
            setActiveRow(null);
            setUpsertOpen(true);
          }}
        >
          Create Customer
        </Button>
      </div>

      {/* Table */}
      <CrudTable columns={columns} data={filteredRows} />

      {/* Upsert Dialog */}
      <CrudUpsertDialog
        open={upsertOpen}
        onOpenChange={setUpsertOpen}
        mode={mode}
        title={mode === "create" ? "Create Customer" : "Edit Customer"}
        schema={customerUpsertSchema}
        defaultValues={{
          name: activeRow?.name ?? "",
          phone: activeRow?.phone ?? "",
          email: activeRow?.email ?? "",
          address: activeRow?.address ?? "",
        }}
        onSubmit={handleUpsert}
      />

      {/* Delete Dialog */}
      <CrudDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete customer?"
        description={`This will remove "${rowToDelete?.name ?? ""}" from active customers.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}

3) src/app/dashboard/customers/page.tsx
import CustomersClient from "./CustomersClient";
import { getCustomers } from "@/actions/customers.actions";

export default async function CustomersPage() {
  const res = await getCustomers({ page: 1, pageSize: 50 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="text-sm text-muted-foreground">
          Create, update, and manage customer records.
        </p>
      </div>

      <CustomersClient rows={res.rows} />
    </div>
  );
}


✅ CRUD done for Customers.

I) Apply This CRUD to ALL Other Dashboard Pages (Fast)

For every new entity page (example: Shipments):

Create these 4 files:
shipments.schema.ts
shipments.actions.ts
shipments.columns.tsx
ShipmentsClient.tsx
page.tsx

Follow the same structure:

actions: create/read/update/delete

schema: zod validation

columns: define table columns + actions

client: render table + create/edit/delete dialogs

This becomes a copy-paste workflow.