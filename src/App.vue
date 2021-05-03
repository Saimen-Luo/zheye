<template>
  <div class="container">
    <global-header :user="currentUser" />
    <validate-form @form-submit="onFormSubmit">
      <div class="mb-3">
        <label for="exampleInputEmail1" class="form-label">邮箱地址</label>
        <validate-input
          :rules="emailRules"
          v-model="emailVal"
          type="email"
          placeholder="请输入邮箱"
        />
        {{ emailVal }}
      </div>
      <div class="mb-3">
        <label for="exampleInputPassword1" class="form-label">密码</label>
        <validate-input
          :rules="passwordRules"
          v-model="passwordVal"
          type="password"
          placeholder="请输入密码"
        />
        {{ passwordVal }}
      </div>
      <template #submit>
        <button type="submit" class="btn btn-danger">提交</button>
      </template>
    </validate-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'

import GlobalHeader, { IUser } from './components/GlobalHeader.vue'
import ValidateInput, { IRule } from './components/ValidateInput.vue'
import ValidateForm from './components/ValidateForm.vue'
import { testColumns } from './testData'

const currentUser: IUser = {
  isLogin: true,
  id: 1,
  name: 'Luo'
}

export default defineComponent({
  name: 'App',
  components: {
    GlobalHeader,
    ValidateInput,
    ValidateForm
  },
  setup () {
    const emailRules: IRule[] = [
      { type: 'required', message: '电子邮箱地址不能为空' },
      { type: 'email', message: '请输入正确的电子邮箱格式' }
    ]
    const passwordRules: IRule[] = [
      { type: 'required', message: '密码不能为空' }
    ]
    const emailVal = ref('')
    const passwordVal = ref('')
    const onFormSubmit = (result: boolean) => {
      console.log('onFormSubmit', result)
    }
    return {
      testColumns,
      currentUser,
      emailRules,
      emailVal,
      passwordRules,
      passwordVal,
      onFormSubmit
    }
  }
})
</script>

<style>
</style>
