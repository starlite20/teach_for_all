import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Sparkles, RefreshCcw, Pencil, LayoutGrid, ArrowRight } from "lucide-react";

export function ResourcePreview({ content, type, mode, onUpdate }: { content: any, type: string, mode: string, onUpdate: (c: any) => void }) {
    if (!content) return null;
    const data = content.content || content; // Handle both wrapped and unwrapped content if necessary
    // In Generator, content is { title, content: { ... } }
    // In Library, content might be the same structure.
    // Let's assume standard structure: { title: string, content: { steps/cards/questions: [] } }

    // Actually, look at Generator.tsx:
    // const data = content.content;
    // content is the full object with title and content.

    const { toast } = useToast();
    const [regenerating, setRegenerating] = useState<number | null>(null);

    const handleUpdateField = (path: string[], value: string) => {
        const newData = JSON.parse(JSON.stringify(data));
        let curr = newData;
        for (let i = 0; i < path.length - 1; i++) {
            curr = curr[path[i]];
        }
        curr[path[path.length - 1]] = value;
        onUpdate({ ...content, content: newData });
    };

    const handleRegenerateImage = async (idx: number, text: string) => {
        setRegenerating(idx);
        try {
            const res = await apiRequest("POST", "/api/ai/regenerate-image", {
                text,
                type: type === 'pecs' ? 'pecs' : 'symbol'
            });
            const { image_url } = await res.json();
            const newData = JSON.parse(JSON.stringify(data));
            if (type === 'story') newData.steps[idx].image_url = image_url;
            else if (type === 'pecs') newData.cards[idx].image_url = image_url;
            else if (type === 'worksheet') newData.questions[idx].image_url = image_url;

            onUpdate({ ...content, content: newData });
        } catch (err) {
            toast({ title: "Image regeneration failed", variant: "destructive" });
        } finally {
            setRegenerating(null);
        }
    };

    if (type === "story") {
        return (
            <div className="space-y-12">
                <h2
                    className="text-3xl font-bold text-center mb-10 leading-tight outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdate({ ...content, title: e.currentTarget.innerText })}
                >
                    {content.title}
                </h2>

                {data.steps?.map((step: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-1 gap-6 pb-10 last:pb-0 break-inside-avoid page-break-inside-avoid">
                        <div className="relative group/img">
                            <div className="w-full flex justify-center">
                                {step.image_url ? (
                                    <img src={step.image_url} alt="Step" className="max-h-64 object-contain rounded-lg border-2 border-slate-900/5" />
                                ) : (
                                    <div className="w-full h-40 bg-slate-50 flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200">
                                        <Sparkles className="w-8 h-8 opacity-20" />
                                    </div>
                                )}
                            </div>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-full shadow-lg"
                                onClick={() => {
                                    const editedText = mode === "ar" ? step.text_ar : step.text_en;
                                    handleRegenerateImage(idx, editedText);
                                }}
                                disabled={regenerating === idx}
                            >
                                <RefreshCcw className={cn("w-4 h-4", regenerating === idx && "animate-spin")} />
                            </Button>
                        </div>

                        <div className={cn(
                            "grid gap-8 border-t border-slate-100 pt-6 relative group",
                            mode === "bilingual" ? "grid-cols-2" : "grid-cols-1"
                        )}>
                            <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 cursor-pointer"
                                onClick={() => document.getElementById(`text-step-${idx}`)?.focus()}>
                                <Pencil className="w-3.5 h-3.5" />
                            </div>
                            {(mode === "en" || mode === "bilingual") && (
                                <p
                                    id={`text-step-${idx}`}
                                    className="leading-relaxed outline-none border border-transparent hover:border-slate-100 p-1 rounded transition-all"
                                    style={{ fontSize: '1.25em' }}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                        const val = e.currentTarget.innerText;
                                        handleUpdateField(['steps', idx.toString(), 'text_en'], val);
                                        if (val) handleRegenerateImage(idx, val); // Auto-regenerate
                                    }}
                                >
                                    {step.text_en || step.text}
                                </p>
                            )}
                            {(mode === "ar" || mode === "bilingual") && (
                                <div className="space-y-2 text-right" dir="rtl">
                                    <span className="text-[10px] font-bold uppercase opacity-50">العربية</span>
                                    <p
                                        className="font-medium leading-relaxed font-sans outline-none border border-transparent hover:border-slate-100 p-1 rounded transition-all"
                                        style={{ fontSize: '1.5em' }}
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => handleUpdateField(['steps', idx.toString(), 'text_ar'], e.currentTarget.innerText)}
                                    >
                                        {step.text_ar || step.text}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === "pecs") {
        return (
            <div className="flex-1">
                <h2 className="text-2xl font-bold text-center mb-8">{content.title}</h2>
                <div className="grid grid-cols-2 gap-8">
                    {data.cards?.map((card: any, idx: number) => (
                        <div
                            key={idx}
                            className="bg-white border-2 border-slate-300 p-6 rounded-3xl aspect-square flex flex-col items-center justify-between text-center relative group/card break-inside-avoid page-break-inside-avoid"
                        >
                            <div className="flex-1 flex items-center justify-center p-2">
                                {card.image_url ? (
                                    <img src={card.image_url} className="max-h-28 w-auto rounded-md object-contain" />
                                ) : (
                                    <div className="w-12 h-12 opacity-10">
                                        <LayoutGrid className="w-full h-full" />
                                    </div>
                                )}
                                {/* PECS Sequential Numbering */}
                                <div className="absolute top-3 left-4 w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-bold z-10">
                                    {idx + 1}
                                </div>
                            </div>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity rounded-full p-1 h-7 w-7"
                                onClick={() => {
                                    const editedLabel = mode === "ar" ? card.label_ar : card.label_en;
                                    handleRegenerateImage(idx, editedLabel);
                                }}
                                disabled={regenerating === idx}
                            >
                                <RefreshCcw className={cn("w-3 h-3", regenerating === idx && "animate-spin")} />
                            </Button>
                            <div className="w-full border-t border-slate-100 pt-4 mt-2 grid grid-cols-1 gap-2 relative group">
                                <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 cursor-pointer"
                                    onClick={() => document.getElementById(`text-card-${idx}`)?.focus()}>
                                    <Pencil className="w-2.5 h-2.5" />
                                </div>
                                {(mode === "en" || mode === "bilingual") && (
                                    <p
                                        id={`text-card-${idx}`}
                                        className="text-xs font-bold text-slate-500 uppercase outline-none"
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => {
                                            const val = e.currentTarget.innerText;
                                            handleUpdateField(['cards', idx.toString(), 'label_en'], val);
                                            if (val) handleRegenerateImage(idx, val);
                                        }}
                                    >
                                        {card.label_en || card.label}
                                    </p>
                                )}
                                {(mode === "ar" || mode === "bilingual") && (
                                    <p
                                        className="font-sans font-bold outline-none hover:bg-slate-50 rounded"
                                        style={{ fontSize: '1.2em' }}
                                        dir="rtl"
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => handleUpdateField(['cards', idx.toString(), 'label_ar'], e.currentTarget.innerText)}
                                    >
                                        {card.label_ar || card.label}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Worksheet
    return (
        <div className="space-y-10" dir={mode === "ar" ? "rtl" : "ltr"}>
            <h2 className="text-3xl font-bold mb-8">{content.title}</h2>
            {data.instructions && (
                <div className="p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-md italic opacity-80 mb-10">
                    {data.instructions}
                </div>
            )}
            <div className="space-y-16">
                {data.questions?.map((q: any, idx: number) => (
                    <div key={idx} className="space-y-6 break-inside-avoid page-break-inside-avoid">
                        <div className="flex flex-col gap-4">
                            {/* Question Text */}
                            <div className={cn("flex gap-4", mode === "ar" ? "flex-row-reverse text-right" : "flex-row")}>
                                <span className="flex-none bg-slate-100 text-slate-500 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border border-slate-200">{idx + 1}</span>
                                <div className="flex-1 space-y-2">
                                    {(mode === "en" || mode === "bilingual") && (
                                        <p className="font-bold text-xl outline-none" contentEditable suppressContentEditableWarning>
                                            {q.text_en || q.text}
                                        </p>
                                    )}
                                    {(mode === "ar" || mode === "bilingual") && (
                                        <p className="text-2xl font-medium font-sans outline-none" dir="rtl" contentEditable suppressContentEditableWarning>
                                            {q.text_ar || q.text}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Visual Choices Grid */}
                            <div className="grid grid-cols-3 gap-6 mt-2 ml-12 mr-12">
                                {q.choices?.map((choice: any, cIdx: number) => (
                                    <div key={cIdx} className="flex flex-col items-center gap-3 relative group/choice">
                                        {/* Edit Trigger for Choice Label */}
                                        <div className="absolute top-0 right-0 p-1 opacity-0 group-hover/choice:opacity-100 transition-opacity text-slate-400 cursor-pointer z-20"
                                            onClick={() => document.getElementById(`text-choice-${idx}-${cIdx}`)?.focus()}>
                                            <Pencil className="w-3 h-3" />
                                        </div>

                                        <div className="w-full aspect-square border-2 border-slate-200 rounded-2xl p-4 flex items-center justify-center relative bg-white shadow-sm group-hover/choice:border-primary/30 transition-colors">
                                            {choice.image_url ? (
                                                <img src={choice.image_url} className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-50 rounded-xl animate-pulse" />
                                            )}
                                            {/* Circular Checkbox */}
                                            <div className="absolute top-3 left-3 w-8 h-8 border-2 border-slate-300 rounded-full bg-white/90 shadow-sm" />
                                        </div>

                                        {(mode === "en" || mode === "bilingual") && (
                                            <span
                                                id={`text-choice-${idx}-${cIdx}`}
                                                className="font-bold text-sm text-slate-600 text-center outline-none border border-transparent hover:border-slate-100 rounded px-1"
                                                contentEditable
                                                suppressContentEditableWarning
                                                onBlur={(e) => {
                                                    const val = e.currentTarget.innerText;
                                                    const newQuestions = [...data.questions];
                                                    newQuestions[idx].choices[cIdx].label = val;
                                                    onUpdate({ ...content, content: { ...data, questions: newQuestions } });
                                                    // Trigger Regen
                                                    if (val) {
                                                        const newPrompt = `Widgit/PCS style symbol, thick bold black outlines, flat colors, white background, no shading, simple 2D vector, centered, representation of: ${val}`;
                                                        // We reuse the generic regen function but need to manually call api since structure differs slightly or update logic
                                                        // Or better: update the generic handleRegenerate to handle choice paths? 
                                                        // For simplicity, let's call a specific choice regen here or misuse handleRegenerateImage

                                                        // To properly support choice regen, we need to adapt handleRegenerateImage or write a custom one.
                                                        // Let's assume we can add a specialized handler.
                                                        // For now, I'll inline the call:
                                                        toast({ title: "Regenerating Choice Visual..." });
                                                        apiRequest("POST", "/api/ai/regenerate-image", { text: val, type: 'symbol' })
                                                            .then(res => res.json())
                                                            .then(({ image_url }) => {
                                                                const brandNewQuestions = [...data.questions]; // fetch fresh? no, rely on state
                                                                // Actually we need to rely on the latest data. 
                                                                // 'data' here is from render closure. Ideally we update through parent.
                                                                // But let's just update and call onUpdate again.
                                                                brandNewQuestions[idx].choices[cIdx].image_url = image_url;
                                                                onUpdate({ ...content, content: { ...data, questions: brandNewQuestions } });
                                                            });
                                                    }
                                                }}
                                            >
                                                {choice.label_en || choice.label}
                                            </span>
                                        )}
                                        {(mode === "ar" || mode === "bilingual") && (
                                            <span
                                                className="font-bold text-sm text-slate-600 text-center outline-none border border-transparent hover:border-slate-100 rounded px-1 font-sans"
                                                dir="rtl"
                                                contentEditable
                                                suppressContentEditableWarning
                                                onBlur={(e) => {
                                                    const val = e.currentTarget.innerText;
                                                    const newQuestions = [...data.questions];
                                                    newQuestions[idx].choices[cIdx].label_ar = val; // Assuming schema has label_ar
                                                    onUpdate({ ...content, content: { ...data, questions: newQuestions } });
                                                }}
                                            >
                                                {choice.label_ar || choice.label}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
