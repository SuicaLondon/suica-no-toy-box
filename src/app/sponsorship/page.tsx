"use client";

import { Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSponsorshipSearch } from "@/lib/hooks/use-sponsorship-search";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { sponsorSearchSchema } from "@/lib/schemas/sponsor";

type SearchFormData = z.infer<typeof sponsorSearchSchema>;

export default function SponsorPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SearchFormData>({
    resolver: zodResolver(sponsorSearchSchema),
  });

  const companyName = watch("companyName");
  const { data: results, isLoading, error } = useSponsorshipSearch(companyName);

  const onSubmit = (data: SearchFormData) => {
    console.log("Search submitted:", data);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Sponsor Search
          </h1>
          <p className="text-lg text-gray-600">
            Search for company sponsorship information in the UK
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
          <div className="relative">
            <input
              {...register("companyName")}
              type="text"
              placeholder="Enter company name..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute top-1/2 right-2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
            >
              <Search className="h-6 w-6" />
            </button>
          </div>
          {errors.companyName && (
            <p className="mt-2 text-sm text-red-600">
              {errors.companyName.message}
            </p>
          )}
        </form>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error instanceof Error
              ? error.message
              : "Failed to fetch results. Please try again."}
          </div>
        )}

        {isLoading ? (
          <div className="py-8 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Searching...</p>
          </div>
        ) : results && results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  {result.name}
                </h3>
                <p className="text-gray-600">{result.city}</p>
              </div>
            ))}
          </div>
        ) : companyName && !isLoading ? (
          <div className="py-8 text-center text-gray-500">
            No results found for {companyName}
          </div>
        ) : null}
      </div>
    </div>
  );
}
