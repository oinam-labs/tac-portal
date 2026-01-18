"use client";

import { useState } from "react";
import { motion, LayoutGroup } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface GalleryItem {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    color: string;
}

interface FluidExpandingGridProps {
    items: GalleryItem[];
    className?: string;
    id?: string;
}

export default function FluidExpandingGrid({
    items,
    className,
    id = "fluid-gallery",
}: FluidExpandingGridProps) {
    const [layout, setLayout] = useState(() => {
        // Determine initial layout based on item count
        const ids = items.map((item) => item.id);
        return {
            row1: ids.slice(0, 2),
            row2: ids.slice(2, Math.min(items.length, 4)),
        };
    });

    const handleExpand = (id: string) => {
        const inRow1 = layout.row1.includes(id);
        const inRow2 = layout.row2.includes(id);

        // Prevent collapsing if it's the only item in the row
        if (
            (inRow1 && layout.row1.length === 1) ||
            (inRow2 && layout.row2.length === 1)
        )
            return;

        if (inRow1) {
            const neighbor = layout.row1.find((i) => i !== id)!;
            setLayout({
                row1: [id],
                row2: [neighbor, ...layout.row2.filter((i) => i !== neighbor)].slice(
                    0,
                    2
                ),
            });
        } else {
            const neighbor = layout.row2.find((i) => i !== id)!;
            setLayout({
                row1: [neighbor, ...layout.row1.filter((i) => i !== neighbor)].slice(
                    0,
                    2
                ),
                row2: [id],
            });
        }
    };

    return (
        <div
            className={cn(
                "w-full h-full flex items-center justify-center overflow-hidden py-12 not-prose",
                className
            )}
        >
            <div className="w-full max-w-7xl px-0">
                <LayoutGroup id={id}>
                    <motion.div
                        layout
                        className="grid grid-cols-2 grid-rows-2 gap-4 w-full h-[400px] sm:h-[600px]"
                    >
                        {items.map((item) => {
                            const isRow1 = layout.row1.includes(item.id);
                            const rowArr = isRow1 ? layout.row1 : layout.row2;
                            const isSelected = rowArr.length === 1 && rowArr[0] === item.id;

                            const gridRow = isRow1 ? 1 : 2;
                            let gridColumn = "";
                            if (isSelected) {
                                gridColumn = "1 / span 2";
                            } else {
                                if (isRow1) {
                                    gridColumn = layout.row1.indexOf(item.id) === 0 ? "1" : "2";
                                } else {
                                    gridColumn = layout.row2.indexOf(item.id) === 0 ? "1" : "2";
                                }
                            }

                            return (
                                <motion.div
                                    key={item.id}
                                    layoutId={`${id}-${item.id}`}
                                    onClick={() => handleExpand(item.id)}
                                    style={{ gridRow, gridColumn } as any}
                                    className={cn(
                                        "relative cursor-pointer group w-full h-full overflow-hidden",
                                        isSelected ? "z-30" : "z-10"
                                    )}
                                    transition={{
                                        layout: {
                                            type: "spring",
                                            stiffness: 100,
                                            damping: 25,
                                        },
                                    }}
                                >
                                    <motion.div
                                        layoutId={`${id}-${item.id}-mask-wrapper`}
                                        className="absolute inset-0 overflow-hidden bg-card border border-border"
                                        style={{ borderRadius: 24 }}
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className={cn(
                                                "absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out opacity-60 group-hover:opacity-80 group-hover:scale-105",
                                                isSelected
                                                    ? "object-[center_35%] scale-105 opacity-80"
                                                    : "object-[center_50%]"
                                            )}
                                        />
                                        <motion.div
                                            layoutId={`${id}-${item.id}-mask`}
                                            className={cn(
                                                "absolute inset-0 transition-colors duration-700 bg-gradient-to-t from-black/80 via-black/40 to-transparent",
                                                isSelected ? "from-black/60" : "from-black/80"
                                            )}
                                        />
                                    </motion.div>

                                    <motion.div
                                        layout="position"
                                        className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-white z-10 select-none"
                                    >
                                        <motion.div layout="position" className="overflow-hidden">
                                            <motion.h3
                                                layout="position"
                                                className="text-2xl sm:text-4xl font-bold mb-2 tracking-tight uppercase font-mono"
                                                style={{ color: isSelected ? item.color : "white" }}
                                            >
                                                {item.title}
                                            </motion.h3>
                                            <motion.p
                                                layout="position"
                                                className="text-sm sm:text-base text-gray-300 font-medium max-w-md"
                                            >
                                                {item.subtitle}
                                            </motion.p>
                                        </motion.div>
                                    </motion.div>

                                    <motion.div
                                        layoutId={`${id}-${item.id}-overlay`}
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            borderRadius: 24,
                                        }}
                                    />
                                    <motion.div
                                        layoutId={`${id}-${item.id}-border`}
                                        className="absolute inset-0 border border-white/10 group-hover:border-white/30 transition-colors duration-500 pointer-events-none"
                                        style={{ borderRadius: 24 }}
                                    />
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </LayoutGroup>
            </div>
        </div>
    );
}
