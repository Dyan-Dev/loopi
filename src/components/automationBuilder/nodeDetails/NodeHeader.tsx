import { Trash2 } from "lucide-react";
import { Button } from "../../ui/button";

/**
 * NodeHeader - Header component for node detail panel
 * Displays node type and delete button (except for root node)
 */
export default function NodeHeader({
  title,
  id,
  onDelete,
}: {
  title: string;
  id: string;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium capitalize">{title}</span>
      <Button variant="ghost" size="sm" onClick={() => onDelete(id)}>
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
