import { createStore, combineReducers, bindActionCreators } from 'redux';
import { Rule, FormModel } from '../src/FormModel';

describe('测试model是否正常', () => {
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
    user: model.handle,
  }));
  const actions = bindActionCreators(model.actions(), store.dispatch);
  test('检查初始的state', () => {
    const state = store.getState();
    expect(state.user).not.toBeNull();
    expect(state.user.nickname).not.toBeNull();
    expect(state.user.mobile).not.toBeNull();
    expect(state.user.mobile.message).toEqual('手机号不能为空或者参数不对');
  })

  test('执行action后state的变化', () => {
    actions.mobile('33738167171');
    let state = store.getState();
    expect(state.user).not.toBeNull();
    expect(state.user.nickname).not.toBeNull();
    expect(state.user.mobile).not.toBeNull();
    expect(state.user.mobile.value).toEqual('33738167171');
    expect(state.user.mobile.message).toEqual('手机号不能为空或者参数不对');
    actions.mobile('13738167171');
    state = store.getState();
    expect(state.user).not.toBeNull();
    expect(state.user.nickname).not.toBeNull();
    expect(state.user.mobile).not.toBeNull();
    expect(state.user.mobile.value).toEqual('13738167171');
    expect(state.user.mobile.message).toEqual('');
  })
  test('测试reset功能', () => {
    actions.reset();
    const state = store.getState();
    expect(state.user.mobile).not.toBeNull();
    expect(state.user.mobile.value).toEqual(null);
    expect(state.user.mobile.message).toEqual('手机号不能为空或者参数不对');
  })

  test('测试fill功能', () => {
    actions.fill({
      nickname: '呵呵',
      mobile: '3737377888'
    });
    const state = store.getState();
    expect(state.user.mobile).not.toBeNull();
    expect(state.user.nickname.value).toEqual('呵呵');
    expect(state.user.mobile.value).toEqual('3737377888');
    expect(state.user.mobile.message).toEqual('手机号不能为空或者参数不对');
  })
});
