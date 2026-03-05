export type FieldType =
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "file"
  | "date"
  | "phone"
  | "url"
  | "rating"
  | "divider"
  | "heading";

export interface FieldDefinition {
  type: FieldType;
  label: string;
  icon: string;
  category: "basic" | "choice" | "advanced" | "layout";
}

export const FIELD_DEFINITIONS: FieldDefinition[] = [
  { type: "text", label: "Text", icon: "Type", category: "basic" },
  { type: "email", label: "Email", icon: "Mail", category: "basic" },
  { type: "number", label: "Number", icon: "Hash", category: "basic" },
  { type: "textarea", label: "Text Area", icon: "AlignLeft", category: "basic" },
  { type: "phone", label: "Phone", icon: "Phone", category: "basic" },
  { type: "url", label: "URL", icon: "Link", category: "basic" },
  { type: "date", label: "Date", icon: "Calendar", category: "basic" },
  { type: "select", label: "Dropdown", icon: "ChevronDown", category: "choice" },
  { type: "checkbox", label: "Checkboxes", icon: "CheckSquare", category: "choice" },
  { type: "radio", label: "Radio Group", icon: "Circle", category: "choice" },
  { type: "file", label: "File Upload", icon: "Upload", category: "advanced" },
  { type: "rating", label: "Rating", icon: "Star", category: "advanced" },
  { type: "divider", label: "Divider", icon: "Minus", category: "layout" },
  { type: "heading", label: "Heading", icon: "Heading", category: "layout" },
];

export type ConditionalOperator = "equals" | "not_equals" | "contains";

export interface ConditionalLogic {
  fieldId: string;
  operator: ConditionalOperator;
  value: string;
}

export interface FormFieldData {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: string[];
  validationRules?: Record<string, unknown>;
  conditionalLogic?: ConditionalLogic;
  order: number;
}

export interface FormStyles {
  background: {
    type: "solid" | "gradient" | "image";
    color: string;
    gradientFrom: string;
    gradientTo: string;
    gradientDirection: string;
    imageUrl: string;
  };
  primaryColor: string;
  fontFamily: string;
  fontSize: "small" | "medium" | "large";
  button: {
    color: string;
    borderRadius: number;
    text: string;
  };
  container: {
    borderRadius: number;
    shadow: "none" | "sm" | "md" | "lg" | "xl";
    padding: number;
    maxWidth: number;
  };
  liquidGlass: boolean;
}

export const DEFAULT_FORM_STYLES: FormStyles = {
  background: {
    type: "gradient",
    color: "#f8fafc",
    gradientFrom: "#f8fafc",
    gradientTo: "#eff6ff",
    gradientDirection: "to bottom right",
    imageUrl: "",
  },
  primaryColor: "#2563eb",
  fontFamily: "Inter",
  fontSize: "medium",
  button: {
    color: "#2563eb",
    borderRadius: 8,
    text: "Submit",
  },
  container: {
    borderRadius: 12,
    shadow: "lg",
    padding: 32,
    maxWidth: 512,
  },
  liquidGlass: false,
};

export const FONT_OPTIONS = [
  { label: "Inter", value: "Inter" },
  { label: "Roboto", value: "Roboto" },
  { label: "Open Sans", value: "Open Sans" },
  { label: "Lato", value: "Lato" },
  { label: "Poppins", value: "Poppins" },
  { label: "Playfair Display", value: "Playfair Display" },
  { label: "Merriweather", value: "Merriweather" },
] as const;

export const GRADIENT_DIRECTIONS = [
  { label: "↘ Bottom Right", value: "to bottom right" },
  { label: "↓ Bottom", value: "to bottom" },
  { label: "→ Right", value: "to right" },
  { label: "↗ Top Right", value: "to top right" },
] as const;

export interface FormBuilderState {
  id: string;
  title: string;
  description: string;
  fields: FormFieldData[];
  selectedFieldId: string | null;
}
