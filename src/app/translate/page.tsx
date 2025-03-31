"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftRight, Copy, Languages } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { languages } from "@/lib/constants/languages";
import { translateSchema, TranslateFormValues } from "@/lib/schemas/translate";
import { useState } from "react";

export default function TranslatePage() {
    const [isTranslating, setIsTranslating] = useState(false);

    const form = useForm<TranslateFormValues>({
        resolver: zodResolver(translateSchema),
        defaultValues: {
            sourceText: "",
            targetText: "",
            sourceLang: "en",
            targetLang: "es",
        },
    });

    const handleSwapLanguages = () => {
        const currentValues = form.getValues();
        form.setValue("sourceLang", currentValues.targetLang);
        form.setValue("targetLang", currentValues.sourceLang);
        form.setValue("sourceText", currentValues.targetText);
        form.setValue("targetText", currentValues.sourceText);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const onSubmit = async (data: TranslateFormValues) => {
        setIsTranslating(true);
        try {
            // Here you would typically make an API call to translate the text
            // For now, we'll just simulate a delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            form.setValue("targetText", `Translated: ${data.sourceText}`);
        } catch (error) {
            console.error("Translation failed:", error);
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Languages className="w-6 h-6" />
                        Translator
                    </h1>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleSwapLanguages}
                    >
                        <ArrowLeftRight className="w-4 h-4 mr-2" />
                        Swap Languages
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Controller
                            name="sourceLang"
                            control={form.control}
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {languages.map((lang) => (
                                            <SelectItem key={lang.code} value={lang.code}>
                                                {lang.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <div className="relative">
                            <Controller
                                name="sourceText"
                                control={form.control}
                                render={({ field, fieldState: { error } }) => (
                                    <>
                                        <Textarea
                                            {...field}
                                            placeholder="Enter text to translate"
                                            className="min-h-[200px] pr-10"
                                        />
                                        {error && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {error.message}
                                            </p>
                                        )}
                                    </>
                                )}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2"
                                onClick={() => handleCopy(form.getValues("sourceText"))}
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Controller
                            name="targetLang"
                            control={form.control}
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {languages.map((lang) => (
                                            <SelectItem key={lang.code} value={lang.code}>
                                                {lang.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <div className="relative">
                            <Controller
                                name="targetText"
                                control={form.control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        placeholder="Translation"
                                        className="min-h-[200px] pr-10"
                                        readOnly
                                    />
                                )}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-2"
                                onClick={() => handleCopy(form.getValues("targetText"))}
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        className="w-32"
                        disabled={isTranslating}
                    >
                        {isTranslating ? "Translating..." : "Translate"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
