import type { GrillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import { Card } from "suica-ui/card";
import { MapsText } from "../common/maps-text";

/** Before a check: where the verdict will appear, and what it will say. */
export function IdleCard({ messages }: { messages: GrillRestaurantMessages }) {
  return (
    <Card className="flex min-h-44 items-center justify-center border-dashed px-7 py-10 text-center">
      <div>
        <h2 className="font-heading m-0 text-xl leading-tight tracking-tight text-balance">
          {messages.idleTitle}
        </h2>
        <p className="text-toy-muted mx-auto mt-2.5 mb-0 max-w-md text-sm leading-relaxed">
          <MapsText>{messages.idleBody}</MapsText>
        </p>
      </div>
    </Card>
  );
}
