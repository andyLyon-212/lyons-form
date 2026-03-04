"use client";

import {
  type FormStyles,
  FONT_OPTIONS,
  GRADIENT_DIRECTIONS,
} from "@/lib/builder-types";

interface StylePanelProps {
  styles: FormStyles;
  onUpdate: (styles: FormStyles) => void;
}

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";
const sectionClass = "space-y-3";
const sectionTitleClass =
  "text-xs font-semibold uppercase text-muted-foreground";

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border border-input"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
}

export function StylePanel({ styles, onUpdate }: StylePanelProps) {
  const update = (patch: Partial<FormStyles>) => {
    onUpdate({ ...styles, ...patch });
  };

  const updateBackground = (
    patch: Partial<FormStyles["background"]>
  ) => {
    update({ background: { ...styles.background, ...patch } });
  };

  const updateButton = (patch: Partial<FormStyles["button"]>) => {
    update({ button: { ...styles.button, ...patch } });
  };

  const updateContainer = (
    patch: Partial<FormStyles["container"]>
  ) => {
    update({ container: { ...styles.container, ...patch } });
  };

  return (
    <div className="flex h-full w-72 flex-col border-l border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Form Style</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Background */}
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Background</h3>
          <div>
            <label className={labelClass}>Type</label>
            <select
              value={styles.background.type}
              onChange={(e) =>
                updateBackground({
                  type: e.target.value as FormStyles["background"]["type"],
                })
              }
              className={inputClass}
            >
              <option value="solid">Solid Color</option>
              <option value="gradient">Gradient</option>
              <option value="image">Image URL</option>
            </select>
          </div>

          {styles.background.type === "solid" && (
            <ColorInput
              label="Color"
              value={styles.background.color}
              onChange={(color) => updateBackground({ color })}
            />
          )}

          {styles.background.type === "gradient" && (
            <>
              <ColorInput
                label="From"
                value={styles.background.gradientFrom}
                onChange={(gradientFrom) => updateBackground({ gradientFrom })}
              />
              <ColorInput
                label="To"
                value={styles.background.gradientTo}
                onChange={(gradientTo) => updateBackground({ gradientTo })}
              />
              <div>
                <label className={labelClass}>Direction</label>
                <select
                  value={styles.background.gradientDirection}
                  onChange={(e) =>
                    updateBackground({ gradientDirection: e.target.value })
                  }
                  className={inputClass}
                >
                  {GRADIENT_DIRECTIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {styles.background.type === "image" && (
            <div>
              <label className={labelClass}>Image URL</label>
              <input
                type="url"
                value={styles.background.imageUrl}
                onChange={(e) =>
                  updateBackground({ imageUrl: e.target.value })
                }
                placeholder="https://example.com/bg.jpg"
                className={inputClass}
              />
            </div>
          )}
        </div>

        {/* Primary Color */}
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Colors</h3>
          <ColorInput
            label="Primary Color"
            value={styles.primaryColor}
            onChange={(primaryColor) => update({ primaryColor })}
          />
        </div>

        {/* Typography */}
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Typography</h3>
          <div>
            <label className={labelClass}>Font Family</label>
            <select
              value={styles.fontFamily}
              onChange={(e) => update({ fontFamily: e.target.value })}
              className={inputClass}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Font Size</label>
            <select
              value={styles.fontSize}
              onChange={(e) =>
                update({
                  fontSize: e.target.value as FormStyles["fontSize"],
                })
              }
              className={inputClass}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        {/* Button */}
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Submit Button</h3>
          <ColorInput
            label="Button Color"
            value={styles.button.color}
            onChange={(color) => updateButton({ color })}
          />
          <div>
            <label className={labelClass}>Button Text</label>
            <input
              type="text"
              value={styles.button.text}
              onChange={(e) => updateButton({ text: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Border Radius (px)</label>
            <input
              type="number"
              min={0}
              max={50}
              value={styles.button.borderRadius}
              onChange={(e) =>
                updateButton({ borderRadius: Number(e.target.value) || 0 })
              }
              className={inputClass}
            />
          </div>
        </div>

        {/* Container */}
        <div className={sectionClass}>
          <h3 className={sectionTitleClass}>Form Container</h3>
          <div>
            <label className={labelClass}>Border Radius (px)</label>
            <input
              type="number"
              min={0}
              max={50}
              value={styles.container.borderRadius}
              onChange={(e) =>
                updateContainer({
                  borderRadius: Number(e.target.value) || 0,
                })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Shadow</label>
            <select
              value={styles.container.shadow}
              onChange={(e) =>
                updateContainer({
                  shadow: e.target.value as FormStyles["container"]["shadow"],
                })
              }
              className={inputClass}
            >
              <option value="none">None</option>
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Padding (px)</label>
            <input
              type="number"
              min={8}
              max={64}
              value={styles.container.padding}
              onChange={(e) =>
                updateContainer({ padding: Number(e.target.value) || 32 })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Max Width (px)</label>
            <input
              type="number"
              min={320}
              max={960}
              step={32}
              value={styles.container.maxWidth}
              onChange={(e) =>
                updateContainer({
                  maxWidth: Number(e.target.value) || 512,
                })
              }
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
