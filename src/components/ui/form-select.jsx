import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * A drop-in replacement for native <select> using Radix UI Select.
 * @param {string} value - current value
 * @param {(value: string) => void} onChange - callback receiving the new value
 * @param {string} placeholder - placeholder text when no value
 * @param {{value: string, label: string}[]} options - select options
 * @param {string} className - classes for the trigger element
 */
export default function FormSelect({ value, onChange, placeholder, options = [], className }) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}