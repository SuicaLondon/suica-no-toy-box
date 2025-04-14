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
import DinnerResult from "@/lib/features/dinner/dinner-result";
import { DinnerRoulette } from "@/lib/features/dinner/dinner-roulette";
import { CuisineFormValues, cuisineSchema } from "@/schemas/dinner-decider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function DinnerDecider() {
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

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

  const startRoulette = () => {
    if (cuisines.length === 0) return;

    // Select the result first
    const randomIndex = Math.floor(Math.random() * cuisines.length);
    setSelectedCuisine(cuisines[randomIndex]);
    setIsSpinning(true);
  };

  const handleSpinComplete = () => {
    setIsSpinning(false);
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

              <Button
                onClick={startRoulette}
                className="w-full"
                disabled={isSpinning}
              >
                {isSpinning ? "Spinning..." : "Decide Dinner!"}
              </Button>

              {cuisines.length > 1 && (
                <div className="relative flex h-[300px] w-full items-center justify-center">
                  <DinnerRoulette
                    options={cuisines}
                    result={selectedCuisine || ""}
                    onSpinComplete={handleSpinComplete}
                  />
                </div>
              )}

              {selectedCuisine && !isSpinning && (
                <DinnerResult result={selectedCuisine} />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
