"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/lib/components/ui/button";
import { useSponsorshipSearch } from "@/lib/hooks/use-sponsorship-search";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Search } from "lucide-react";
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

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : "Failed to fetch results. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : results && results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result, index) => (
              <Card key={index} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl">{result.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{result.city}</Badge>
                    <Badge variant="outline">{result.county}</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Type: {result.type}
                  </p>
                </CardContent>
                <CardFooter>
                  <Badge variant="secondary">Rate: {result.rate}</Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : companyName && !isLoading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              No results found for {companyName}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
