import { createStore, combineReducers } from 'redux';
import * as React from 'react';
import { Provider } from 'react-redux';
import { mount, configure } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16';

import { CreateForm, FormModel, Rule } from '../src';

configure({
  adapter: new Adapter()
});

describe('测试form是否正常', () => {
  const model = new FormModel({
    name: 'user',
    rules: [
      new Rule({
        key: 'nickname',
        message: '用户名不能为空',
      }),
      new Rule({
        key: 'mobile',
        message: '手机号不能为空或者参数不对',
        validate: (mobile) => /^1\d{10}$/.test(mobile)
      })
    ]
  })
  const store = createStore(combineReducers({
    form: combineReducers({ user: model.handle })
  }));
  const UserForm = CreateForm({
    name: 'user',
  })

  interface InputItemOptions {
    field?: string;
    value?: any;
    onChange?: (_: any) => void;
  }
  const InputItem = ({ value, onChange, field, ...rest }: InputItemOptions) => (
    <input type='text' value={value || ''} onChange={(e) => onChange && onChange(e.target.value)} className={field} {...rest} />
  )

  const SubmitButton = ({ submit, ...rest }) => (
    <div {...rest}/>
  )

  const extra = {
    onClick(form){}
  };

  const element = (
    <Provider store={store}>
      <div>
        <UserForm>
          <InputItem field='nickname' />
          <InputItem field='mobile' />
          <SubmitButton onClick={form => extra.onClick(form)} className='button' submit />
        </UserForm>
      </div>
    </Provider>
  )
  const page = mount(element);
  const nickname = page.find('input').at(0);
  const mobile = page.find('input').at(1);
  const button = page.find('.button').at(0);
  const name = 'guoshencheng';
  const m = '1333330';
  it('变更了一个输入后，state会随之改变', () => {
    nickname.simulate('change', {
      target: {
        name: 'nickname', value: name
      }
    });
    const state = store.getState();
    expect(state.form.user.nickname.value).toBe(name);
    expect(state.form.user.nickname.vaild).toBe(true);
  })
  it('输入一个不合法的电话', () => {
    mobile.simulate('change', {
      target: {
        name: 'mibile', value: m
      }
    });
    const state = store.getState();
    expect(state.form.user.mobile.value).toBe(m);
    expect(state.form.user.mobile.vaild).toBe(false);
  })
  it('提交获取到数据', () => {
    extra.onClick = (form) => {
      expect(form.mobile.value).toBe(m);
      expect(form.nickname.value).toBe(name);
    }
    button.simulate('click');
  })
})
