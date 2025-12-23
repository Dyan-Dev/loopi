import { Target } from "lucide-react";
import React from "react";
import { Button } from "../../../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";

/**
 * SelectorButton - Trigger button for interactive element selector
 *
 * Initiates the browser-based element picker when clicked.
 * Used in step configuration forms that require CSS selectors.
 */
export default function SelectorButton({
  onPick,
  title = "Pick element from browser",
}: {
  onPick: (strategy: "css" | "xpath" | "dataAttr" | "id" | "aria") => Promise<void>;
  title?: string;
}) {
  type Strategy = "css" | "xpath" | "dataAttr" | "id" | "aria";
  const [strategy, setStrategy] = React.useState<Strategy>("css");
  return (
    <div className="flex items-center gap-2">
      <Select value={strategy} onValueChange={(v) => setStrategy(v as Strategy)}>
        <SelectTrigger className="h-8 w-[110px] text-xs">
          <SelectValue placeholder="Selector" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="css">CSS</SelectItem>
          <SelectItem value="xpath">XPath</SelectItem>
          <SelectItem value="dataAttr">Data Attr</SelectItem>
          <SelectItem value="id">ID</SelectItem>
          <SelectItem value="aria">ARIA</SelectItem>
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={async () => {
          await onPick(strategy);
        }}
        title={title}
      >
        <Target className="h-3 w-3" />
      </Button>
    </div>
  );
}
