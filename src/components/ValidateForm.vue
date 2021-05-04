<template>
  <form class="validate-form-container">
    <slot name="default"></slot>
    <div class="submit-area" @click.prevent="() => {}" @mousedown="submitForm">
      <slot name="submit">
        <button type="submit" class="btn btn-primary">提交</button>
      </slot>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, onUnmounted } from 'vue'
import mitt, { Handler } from 'mitt'

type ValidateFunc = () => boolean
// 实例化mitt
export const emitter = mitt()

export default defineComponent({
  name: 'ValidateForm',
  emits: ['form-submit'],
  setup (props, context) {
    let funcArr: ValidateFunc[] = []
    const submitForm = () => {
      // 循环执行数组 得到最后的验证结果
      // 先用map方法得到包含所有验证结果的数组，再用every获取最终结果
      const result = funcArr.map(func => func()).every(result => result)
      context.emit('form-submit', result)
    }
    const cb: Handler = (func: ValidateFunc) => {
      // 将监听得到的验证函数都存到一个数组中
      funcArr.push(func)
    }
    // 添加监听
    emitter.on('form-item-created', cb)
    onUnmounted(() => {
      // 删除监听
      emitter.off('form-item-created', cb)
      funcArr = []
    })
    return {
      submitForm
    }
  }
})
</script>
