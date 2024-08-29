export interface ColumnStructure {
  thead: string;
  ttype: 'text' | 'number' | 'date' | 'boolean' | 'actions' | 'verified';
  value: string;
  filterplaceholder?: string;
  hasFilter: boolean;
  visible: boolean;
}

export interface FieldConfig {
  md_col: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  formName: string;
  validator?: string;
  message?: string;
  formValue?: any;
  visible?: boolean;
}

export interface FormConfig {
  title: string;
  data: FieldConfig[];
}
