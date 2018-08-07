import { Reducer } from 'redux';

const prefix = '@/FORM_REDUCER';

const toUnderscore = (origin: string): string => origin
  .replace(/\.?([A-Z])/g, (x, y) => `_${y.toLowerCase()}`)
  .replace(/^_/, '').toUpperCase();

function only(rules: Rule<any>[]): any {
  const result = {};
  Object.keys(this).forEach(key => {
    const rule = rules.filter(r => r.key === key)[0];
    if (rule) {
      result[key] = rule.toField(this[key]);
    }
  })
  return result;
}

export function ModifyChildren(children?: JSX.Element[]): JSX.Element[] | JSX.Element | undefined {
  if (!children) return children;
  if (Array.isArray(children)) {
    if (children.length > 1) {
      return children;
    } else {
      return children[0];
    }
  } else {
    return children;
  }
}

export interface RuleOption<T> {
  key: string;
  message: string | ((_: T) => string);
  validate: ((_: T) => boolean);
  defaultValue: T,
}

export interface FormField<T> {
  vaild: boolean;
  message: string;
  value: T;
}

export class Rule<T> {
  key: string;
  message: string | ((_: T) => string);
  validate: ((_: T) => boolean);
  defaultValue: T;
  constructor(options: RuleOption<T>) {
    const { message, validate, key } = options;
    this.key = key;
    this.message = message || `${key} 校验失败`;
    this.validate = validate || ((data: T) => (typeof data === 'boolean' || Boolean(data)));
  }

  toField(value?: T): FormField<T> {
    value = value || this.defaultValue || null;
    let message;
    if (typeof this.message === 'function') {
      message = this.message(value);
    } else {
      message = this.message;
    }
    const vaild = this.validate(value);
    return {
      value,
      vaild,
      message: vaild ? '' : message,
    };
  }
}

export interface FormModelOptions {
  rules: Rule<any>[];
  name: string;
}

export type FormReduxReducer<S, D> = (state: S, value?: D) => S;

export class FormReducer<State> {
  rules: Rule<any>[];
  name: string;
  defaultState: State
  reducers: {
    [key: string]: FormReduxReducer<any, any>,
  }
  constructor({ rules, name }: FormModelOptions) {
    this.rules = rules || [];
    this.name = name;
    this.defaultState = rules.reduce((pre, rule) => {
      pre[rule.key] = rule.toField();
      return pre;
    }, {}) as State;
    this.initReducer();
  }

  initReducer() {
    this.reducers = {};
    this.rules.forEach((rule) => {
      this.reducers[`${prefix}/${this.name}/CHANGE_FIELD_${toUnderscore(rule.key)}`] = (state, value) => ({
        ...state, [rule.key]: rule.toField(value),
      });
    });
    this.reducers[`${prefix}/${this.name}/RESET`] = state => ({
      ...state, ...(this.defaultState as any),
    });
    this.reducers[`${prefix}/${this.name}/FILL`] = (state, value) => ({
      ...state, ...only.call(value, this.rules),
    });
  }

  handle: Reducer = (state, action) => {
    state = state || this.defaultState;
    const handler = this.reducers[action.type];
    if (handler) {
      return handler(state, action.payload);
    }
    return state;
  }
}
