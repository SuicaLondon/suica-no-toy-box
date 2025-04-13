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
import { Separator } from "@/components/ui/separator";
import { useSponsorshipSearch } from "@/hooks/use-sponsorship-search";
import SponsorCard from "@/lib/features/sponsorship/sponsor-card";
import SponsorListError from "@/lib/features/sponsorship/sponsor-list-error";
import SponsorListNotFound from "@/lib/features/sponsorship/sponsor-list-not-found";
import SponsorListPlaceholder from "@/lib/features/sponsorship/sponsor-list-placeholder";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const searchSchema = z.object({
  companyName: z.string().min(1, "Please enter a company name"),
  type: z.string().optional(),
  city: z.string().optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

export default function SponsorPage() {
  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      companyName: "",
      type: "",
      city: "",
    },
  });

  const companyName = form.watch("companyName");
  const { data: results, isLoading, error } = useSponsorshipSearch(companyName);

  const onSubmit = (data: SearchFormData) => {
    console.log("Search submitted:", data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Sponsor me</h1>
          <p className="text-muted-foreground text-lg">
            Search for company sponsorship information in the UK
          </p>
        </div>

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
                        disabled={isLoading}
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

        <Separator className="my-8" />

        {error && <SponsorListError error={error} />}

        {isLoading ? (
          <SponsorListPlaceholder />
        ) : results && results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result, index) => (
              <SponsorCard
                key={index}
                name={result.name}
                city={result.city}
                county={result.county}
                type={result.type}
                rate={result.rate}
              />
            ))}
          </div>
        ) : companyName && !isLoading ? (
          <SponsorListNotFound companyName={companyName} />
        ) : null}
      </div>
    </div>
  );
}
