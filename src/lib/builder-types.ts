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

export interface FormBuilderState {
  id: string;
  title: string;
  description: string;
  fields: FormFieldData[];
  selectedFieldId: string | null;
}
