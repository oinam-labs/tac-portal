import { z } from "zod"

export const manifestFormSchema = z.object({
    originHubId: z.string().min(1, "Origin is required"),
    destinationHubId: z.string().min(1, "Destination is required"),

    transportType: z.enum(["AIR", "TRUCK"]),

    // AIR Specific
    flightNo: z.string().optional(),
    flightDate: z.date().optional(),

    // TRUCK Specific
    vehicleNo: z.string().optional(),
    driverName: z.string().optional(),

    // Rules / Filters
    rules: z.object({
        onlyReady: z.boolean().default(true),
        matchDestination: z.boolean().default(true),
        excludeCod: z.boolean().default(false),
    }),

    // Selection
    selectedShipmentIds: z.array(z.string()).default([]),
})
    .superRefine((data, ctx) => {
        if (data.transportType === "AIR") {
            if (!data.flightNo || data.flightNo.trim().length < 3) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["flightNo"],
                    message: "Flight number is required for AIR manifest (min 3 chars).",
                })
            }
        }

        if (data.transportType === "TRUCK") {
            if (!data.vehicleNo || data.vehicleNo.trim().length < 4) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["vehicleNo"],
                    message: "Vehicle number is required for TRUCK manifest (min 4 chars).",
                })
            }
        }

        if (data.selectedShipmentIds.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["selectedShipmentIds"],
                message: "At least one shipment must be selected.",
            })
        }

        if (data.originHubId === data.destinationHubId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["destinationHubId"],
                message: "Destination must be different from Origin.",
            })
        }
    })

export type ManifestFormValues = z.infer<typeof manifestFormSchema>
