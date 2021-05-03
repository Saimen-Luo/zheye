<template>
  <div class="container">
    <global-header :user="currentUser" />
    <form>
      <div class="mb-3">
        <label for="exampleInputEmail1" class="form-label">邮箱地址</label>
        <input
          type="email"
          class="form-control"
          id="exampleInputEmail1"
          v-model="emailRef.val"
          @blur="validateEmail"
        />
        <div id="emailHelp" class="form-text">
          {{ emailRef.message }}
        </div>
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
import { defineComponent, reactive } from 'vue'
import 'bootstrap/dist/css/bootstrap.min.css'

import GlobalHeader, { IUser } from './components/GlobalHeader.vue'
import { testColumns } from './testData'

// 正则 判断是否是邮箱
const emailReg = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

const currentUser: IUser = {
  isLogin: true,
  id: 1,
  name: 'Luo'
}

export default defineComponent({
  name: 'App',
  components: {
    GlobalHeader
  },
  setup () {
    const emailRef = reactive({
      val: '',
      error: false,
      message: ''
    })
    const validateEmail = () => {
      if (emailRef.val.trim() === '') {
        emailRef.error = true
        emailRef.message = '邮件地址不能为空'
      } else if (!emailReg.test(emailRef.val)) {
        emailRef.error = true
        emailRef.message = '邮件地址格式错误'
      }
    }
    return {
      testColumns,
      currentUser,
      emailRef,
      validateEmail
    }
  }
})
</script>

<style>
</style>
