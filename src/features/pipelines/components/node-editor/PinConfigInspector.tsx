import type { PinDefinition } from "@/gen/model";
import { PinPrimitiveType } from "@/gen/model/pinPrimitiveType";
import { PinCardinality } from "@/gen/model/pinCardinality";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sliders, X } from "lucide-react";

interface PinConfigInspectorProps {
  selectedPin: {
    pin: PinDefinition;
    direction: "in" | "out";
    index: number;
  } | null;
  onUpdatePin: (updated: PinDefinition) => void;
  onClose: () => void;
}

export function PinConfigInspector({
  selectedPin,
  onUpdatePin,
  onClose,
}: PinConfigInspectorProps) {
  if (!selectedPin) {
    return (
      <Card className="h-full border-dashed bg-muted/10 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <Sliders className="size-6 text-primary" />
        </div>
        <CardTitle className="text-sm font-semibold mb-1">Pin Inspector</CardTitle>
        <p className="text-xs text-muted-foreground max-w-[220px]">
          Select an Input or Output Pin from the list to configure its schema properties, types, and defaults.
        </p>
      </Card>
    );
  }

  const { pin, direction } = selectedPin;
  const isInput = direction === "in";

  return (
    <Card className="h-full flex flex-col shadow-xs border bg-card">
      <CardHeader className="p-4 pb-3 border-b flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-primary/10 flex items-center justify-center">
            <Sliders className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <span>Configure {isInput ? "Input" : "Output"} Pin</span>
            </CardTitle>
            <p className="text-[11px] font-mono text-muted-foreground">
              {pin.id || "unnamed"}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-foreground"
          onPress={onClose}
        >
          <X className="size-4" />
        </Button>
      </CardHeader>

      <CardContent className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Pin Identifier */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">
            Pin Identifier / Argument Name <span className="text-destructive">*</span>
          </Label>
          <Input
            className="font-mono text-xs"
            placeholder="e.g. target_objects"
            value={pin.id || ""}
            onChange={(e) => onUpdatePin({ ...pin, id: e.target.value })}
          />
          <p className="text-[10px] text-muted-foreground">
            Must match Python argument or dictionary return key.
          </p>
        </div>

        {/* Display Label */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Display Label</Label>
          <Input
            className="text-xs"
            placeholder="e.g. Target 3D Objects"
            value={pin.label || ""}
            onChange={(e) => onUpdatePin({ ...pin, label: e.target.value })}
          />
        </div>

        {/* Data Type */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Data Type</Label>
          <Select
            selectedKey={String(pin.primitiveType ?? 0)}
            onSelectionChange={(key) =>
              onUpdatePin({ ...pin, primitiveType: parseInt(String(key), 10) as PinPrimitiveType })
            }
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem id="0">String (text / raw)</SelectItem>
              <SelectItem id="1">Number (int / float)</SelectItem>
              <SelectItem id="2">Boolean (true / false)</SelectItem>
              <SelectItem id="3">Path (file / folder)</SelectItem>
              <SelectItem id="4">EntityRef (workspace / content reference)</SelectItem>
              <SelectItem id="5">Asset / File (Upload preset, script, file)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cardinality (Single vs Array) */}
        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
          <div className="space-y-0.5">
            <Label className="text-xs font-semibold">Array / List Collection</Label>
            <p className="text-[11px] text-muted-foreground">
              Accepts multiple values as a list.
            </p>
          </div>
          <Switch
            isSelected={pin.cardinality === 1}
            onChange={(checked: boolean) =>
              onUpdatePin({
                ...pin,
                cardinality: checked ? PinCardinality.NUMBER_1 : PinCardinality.NUMBER_0,
              })
            }
          />
        </div>

        {/* Input specific fields */}
        {isInput && (
          <>
            {/* Is Required */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold">Required Pin</Label>
                <p className="text-[11px] text-muted-foreground">
                  Pipeline cannot run if this input pin is unresolved.
                </p>
              </div>
              <Switch
                isSelected={pin.isRequired ?? true}
                onChange={(checked: boolean) =>
                  onUpdatePin({ ...pin, isRequired: checked })
                }
              />
            </div>

            {/* Default Value */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Default Fallback Value</Label>
              <Input
                className="font-mono text-xs"
                placeholder="Optional (e.g. 4096 or 'default_val')"
                value={
                  pin.defaultValue !== null && pin.defaultValue !== undefined
                    ? String(pin.defaultValue)
                    : ""
                }
                onChange={(e) => {
                  const val = e.target.value;
                  onUpdatePin({
                    ...pin,
                    defaultValue: val === "" ? null : val,
                  });
                }}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
