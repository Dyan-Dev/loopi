import type { ReactFlowNode } from "@app-types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@components/ui/command";
import { Dialog, DialogContent } from "@components/ui/dialog";
import { SearchIcon } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useReactFlow } from "reactflow";

interface NodeSearchProps {
  nodes: ReactFlowNode[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNodeSelect: (nodeId: string) => void;
}

/**
 * NodeSearch - Command palette for searching and navigating to nodes
 *
 * Features:
 * - Fuzzy search across node types and custom labels
 * - Keyboard navigation (Ctrl+K to open)
 * - Instant navigation to selected node
 * - Optimized for large graphs (1000+ nodes)
 */
export const NodeSearch: React.FC<NodeSearchProps> = ({
  nodes,
  open,
  onOpenChange,
  onNodeSelect,
}) => {
  const { fitView, getNode } = useReactFlow();
  const [search, setSearch] = useState("");

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  // Handle node selection: navigate and highlight
  const handleSelect = useCallback(
    (nodeId: string) => {
      const node = getNode(nodeId);
      if (node) {
        // Highlight the node by selecting it
        onNodeSelect(nodeId);

        // Smooth navigation to the node
        fitView({
          nodes: [node],
          duration: 400,
          padding: 0.3,
          maxZoom: 1.5,
        });
      }
      onOpenChange(false);
    },
    [fitView, getNode, onNodeSelect, onOpenChange]
  );

  // Get display name for a node based on its type and data
  const getNodeDisplayName = (node: ReactFlowNode): string => {
    const step = node.data.step;
    if (!step) return `Node ${node.id}`;

    // Build a descriptive name based on step type
    switch (step.type) {
      case "navigate":
        return `Navigate to ${step.value || "URL"}`;
      case "click":
        return `Click ${step.selector || "element"}`;
      case "type":
        return `Type into ${step.selector || "field"}`;
      case "screenshot":
        return `Screenshot ${step.savePath ? step.savePath : "page"}`;
      case "wait":
        return `Wait ${step.value || "0"}s`;
      case "scroll":
        return `Scroll ${step.scrollType === "toElement" ? `to ${step.selector || "element"}` : `by ${step.scrollAmount || 0}px`}`;
      case "hover":
        return `Hover ${step.selector || "element"}`;
      case "extract":
        return `Extract ${step.selector || "data"}`;
      case "setVariable":
        return `Set ${node.data.variableName || "variable"}`;
      case "modifyVariable":
        return `Modify ${node.data.variableName || "variable"}`;
      case "apiCall":
        return `API Call to ${step.url || "endpoint"}`;
      case "browserConditional":
        return `Check ${step.selector || "condition"}`;
      case "variableConditional":
        return `Check ${node.data.variableName || "variable"}`;
      case "selectOption":
        return `Select option in ${step.selector || "dropdown"}`;
      case "fileUpload":
        return `Upload file to ${step.selector || "input"}`;
      case "aiOpenAI":
      case "aiAnthropic":
      case "aiOllama":
        return `AI: ${step.model || step.type}`;
      default:
        return step.type;
    }
  };

  // Get searchable text for a node (includes type, selector, value, etc.)
  const getNodeSearchText = (node: ReactFlowNode): string => {
    const step = node.data.step;
    const parts = [node.id, step?.type || ""];

    // Add type-specific searchable fields
    if (step) {
      if ("selector" in step && step.selector) parts.push(step.selector);
      if ("value" in step && step.value) parts.push(step.value);
      if ("url" in step && step.url) parts.push(step.url);
      if ("variableName" in step && step.variableName) parts.push(step.variableName);
    }

    if (node.data.variableName) parts.push(node.data.variableName);
    parts.push(getNodeDisplayName(node));

    return parts.filter(Boolean).join(" ").toLowerCase();
  };

  // Filter nodes based on search query
  const filteredNodes = React.useMemo(() => {
    if (!search.trim()) return nodes;

    const query = search.toLowerCase();
    return nodes.filter((node) => {
      const searchText = getNodeSearchText(node);
      // Simple fuzzy matching: check if all characters appear in order
      let searchIndex = 0;
      for (const char of searchText) {
        if (char === query[searchIndex]) {
          searchIndex++;
          if (searchIndex === query.length) return true;
        }
      }
      // Also do a simple contains check for better UX
      return searchText.includes(query);
    });
  }, [nodes, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0">
        <Command
          shouldFilter={false}
          className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        >
          <CommandInput
            placeholder="Search nodes by type, selector, or value..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No nodes found.</CommandEmpty>
            <CommandGroup heading="Nodes">
              {filteredNodes.map((node) => (
                <CommandItem
                  key={node.id}
                  value={getNodeDisplayName(node)}
                  onSelect={() => handleSelect(node.id)}
                  className="cursor-pointer"
                >
                  <SearchIcon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium truncate">{getNodeDisplayName(node)}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {node.data.step?.type || "unknown"} • ID: {node.id}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default NodeSearch;
