"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CuisineFormValues, cuisineSchema } from "@/schemas/dinner-decider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function DinnerDecider() {
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CuisineFormValues>({
    resolver: zodResolver(cuisineSchema),
  });

  const onSubmit = (data: CuisineFormValues) => {
    setCuisines([...cuisines, data.cuisine]);
    reset();
  };

  const decideDinner = () => {
    if (cuisines.length === 0) return;
    const randomIndex = Math.floor(Math.random() * cuisines.length);
    setSelectedCuisine(cuisines[randomIndex]);
  };

  const removeCuisine = (index: number) => {
    setCuisines(cuisines.filter((_, i) => i !== index));
    setSelectedCuisine(null);
  };

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <Card>
        <CardHeader>
          <CardTitle>What for dinner?</CardTitle>
          <CardDescription>
            Add your cuisine options and let us help you decide what to eat for
            dinner!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cuisine">Add a cuisine option</Label>
              <div className="flex gap-2">
                <Input
                  id="cuisine"
                  placeholder="e.g., Italian, Japanese, Mexican..."
                  {...register("cuisine")}
                />
                <Button type="submit">Add</Button>
              </div>
              {errors.cuisine && (
                <p className="text-sm text-red-500">{errors.cuisine.message}</p>
              )}
            </div>
          </form>

          <Separator className="my-4" />

          {cuisines.length > 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Your Options:</h3>
                <div className="flex flex-wrap gap-2">
                  {cuisines.map((cuisine, index) => (
                    <div
                      key={index}
                      className="bg-secondary flex items-center gap-2 rounded-full px-3 py-1"
                    >
                      <span>{cuisine}</span>
                      <button
                        onClick={() => removeCuisine(index)}
                        className="text-muted-foreground hover:text-foreground text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={decideDinner} className="w-full">
                Decide Dinner!
              </Button>

              {selectedCuisine && (
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <p className="text-lg font-medium">
                    Tonight&apos;s dinner will be:
                  </p>
                  <p className="text-primary mt-2 text-2xl font-bold">
                    {selectedCuisine}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
