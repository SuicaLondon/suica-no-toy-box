"use client";

type ChoiceGroupProps<T extends string> = {
  legend: string;
  /** The radio group's name, unique on the page. */
  name: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** The id of a note that explains the choice. */
  describedBy?: string;
};

/** Two or more side-by-side radio cards. */
export function ChoiceGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  describedBy,
}: ChoiceGroupProps<T>) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="border-toy-line has-checked:bg-toy-hover has-checked:border-toy-accent flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              aria-describedby={describedBy}
              className="accent-toy-accent"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
