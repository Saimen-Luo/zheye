<template>
  <div class="container">
    <global-header :user="currentUser" />
    <form>
      <div class="mb-3">
        <label for="exampleInputEmail1" class="form-label">邮箱地址</label>
        <validate-input :rules="emailRules" v-model="emailVal" />
        {{ emailVal }}
      </div>
      <div class="mb-3">
        <label for="exampleInputPassword1" class="form-label">密码</label>
        <input
          type="password"
          class="form-control"
          id="exampleInputPassword1"
        />
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'

import GlobalHeader, { IUser } from './components/GlobalHeader.vue'
import ValidateInput, { IRule } from './components/ValidateInput.vue'
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
    ValidateInput
  },
  setup () {
    const emailRules: IRule[] = [
      { type: 'required', message: '电子邮箱地址不能为空' },
      { type: 'email', message: '请输入正确的电子邮箱格式' }
    ]
    const emailVal = ref('test')
    return {
      testColumns,
      currentUser,
      emailRules,
      emailVal
    }
  }
})
</script>

<style>
</style>
