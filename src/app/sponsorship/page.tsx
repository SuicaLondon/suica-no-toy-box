"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDebounceCallback } from "usehooks-ts";
import * as z from "zod";

const searchSchema = z.object({
  companyName: z.string().min(1, "Please enter a company name"),
});

type SearchFormData = z.infer<typeof searchSchema>;

export default function SponsorPage() {
  const router = useRouter();
  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      companyName: "",
    },
  });
  const companyName = form.watch("companyName");

  const updateCompanyName = useCallback(
    (name: string) => {
      router.replace(`/sponsorship?companyName=${name}`);
    },
    [router],
  );

  const debouncedUpdateCompanyName = useDebounceCallback(
    updateCompanyName,
    200,
  );

  useEffect(() => {
    if (companyName) {
      debouncedUpdateCompanyName(companyName);
    }
  }, [companyName, debouncedUpdateCompanyName]);

  const onSubmit = (data: SearchFormData) => {
    updateCompanyName(data.companyName);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    placeholder="Enter company name..."
                    className="h-12 text-lg"
                  />
                  <Button
                    type="submit"
                    className="absolute top-1/2 right-2 -translate-y-1/2"
                    variant="ghost"
                    size="icon"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
