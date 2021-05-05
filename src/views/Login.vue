<template>
  <h5 class="my-4 text-center">登录到者也</h5>
  <validate-form @form-submit="onFormSubmit">
    <div class="mb-3">
      <label for="exampleInputEmail1" class="form-label">邮箱地址</label>
      <validate-input
        :rules="emailRules"
        v-model="emailVal"
        type="email"
        placeholder="请输入邮箱"
        ref="emailRef"
      />
    </div>
    <div class="mb-3">
      <label for="exampleInputPassword1" class="form-label">密码</label>
      <validate-input
        :rules="passwordRules"
        v-model="passwordVal"
        type="password"
        placeholder="请输入密码"
      />
    </div>
    <template #submit>
      <button type="submit" class="btn btn-danger">提交</button>
    </template>
  </validate-form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

import ValidateInput, { IRule } from '../components/ValidateInput.vue'
import ValidateForm from '../components/ValidateForm.vue'

export default defineComponent({
  name: 'Login',
  components: {
    ValidateInput,
    ValidateForm
  },
  setup () {
    const router = useRouter()
    const store = useStore()
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
      // console.log('onFormSubmit', result)
      if (result) {
        router.push('/')
        store.commit('login')
      }
    }
    return {
      emailRules,
      emailVal,
      passwordRules,
      passwordVal,
      onFormSubmit
    }
  }
})
</script>
