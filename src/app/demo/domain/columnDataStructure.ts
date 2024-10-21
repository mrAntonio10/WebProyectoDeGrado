import { ValidatorFn, Validators } from "@angular/forms";

export interface ColumnStructure {
  thead: string;
  ttype: 'text' | 'number' | 'decimal' | 'date' | 'boolean' | 'actions' | 'verified';
  value: string;
  filterplaceholder?: string;
  hasFilter: boolean;
  visible: boolean;
  isEditable? : boolean;
  width?: string;
}

export interface FieldConfig {
  md_col: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  formName: string;
  message?: string;
  formValue?: any;
  visible?: boolean;
  validators?:  Array<{ name: string, args? }>;
  length?: number;
  validatorMssg?: string
}

export interface FormConfig {
  title: string;
  data: FieldConfig[];
}
