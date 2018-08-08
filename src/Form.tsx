import * as React from 'react';
import { Fragment } from 'react';
import { prefix } from './constants';
import { toUnderscore } from './util';
import { connect as defaultConnect, Connect, MapStateToPropsParam, MapDispatchToPropsParam } from 'react-redux';

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

const buildChildren = (children: React.ReactElement<any>, name, form, dispatch) => ModifyChildren(
  React.Children.map(children, (element: React.ReactElement<any>) => {
    if (!element.props) {
      return element;
    }
    if (element.props.field) {
      return React.cloneElement(
        element,
        {
          value: form[element.props.field] && form[element.props.field].value,
          onChange: (value) => {
            dispatch({
              type: `${prefix}/${name}/CHANGE_FIELD_${toUnderscore(element.props.field)}`,
              payload: value,
            });
          },
          field: undefined,
        },
      );
    } if (element.props.submit) {
      return React.cloneElement(
        element,
        {
          onClick: () => {
            if (element.props.onClick) element.props.onClick(form);
          },
        },
      );
    }
    // return element;
    const next = buildChildren(element.props.children, name, form, dispatch);
    return React.cloneElement(
      element,
      element.props,
      next,
    );
  }),
);

export interface CreateFormOptions {
  name: string
  connect: Connect
  mapStateToProps?: MapStateToPropsParam<any, any, any>,
  mapActionToProps?: MapDispatchToPropsParam<any, any>,
}

export const CreateForm = ({
  name,
  connect,
  mapStateToProps,
  mapActionToProps,
}: CreateFormOptions) => {
  connect = connect || defaultConnect;
  const mapState = (state, ownProps) => {
    const origin = mapStateToProps && mapStateToProps(state, ownProps)
    return {
      ...origin,
      form: state.form[name]
    }
  };
  const element = ({ form, children, dispatch }) => (
    <Fragment>
    {
      buildChildren(children, name, form, dispatch)
    }
    </Fragment>
  )
  return connect(mapState, mapActionToProps)(element);
}
