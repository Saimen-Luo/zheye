<template>
  <div class="file-upload">
    <button class="btn btn-primary" @click.prevent="trigerUpload">
      <span v-if="fileStatus === 'loading'">正在上传...</span>
      <span v-else-if="fileStatus === 'success'">上传成功</span>
      <span v-else>点击上传</span>
    </button>
    <input
      type="file"
      class="file-input d-none"
      ref="fileInput"
      @change="handleFileChange"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import axios from 'axios'

type UploadStatus = 'ready' | 'loading' | 'success' | 'error'
type CheckFunctioin = (file: File) => boolean

export default defineComponent({
  name: 'Uploader',
  props: {
    action: {
      type: String,
      required: true
    },
    beforeUpload: {
      type: Function as PropType<CheckFunctioin>
    }
  },
  emits: ['file-uploaded', 'file-uploaded-error'],
  setup (props, { emit }) {
    const fileInput = ref<null | HTMLInputElement>(null)
    const fileStatus = ref<UploadStatus>('ready')
    const trigerUpload = () => {
      if (fileInput.value) {
        fileInput.value.click()
      }
    }
    const handleFileChange = (e: Event) => {
      const currentTarget = e.target as HTMLInputElement
      if (currentTarget.files) {
        const file = currentTarget.files[0]
        if (props.beforeUpload) {
          const result = props.beforeUpload(file)
          if (!result) {
            return
          }
        }
        fileStatus.value = 'loading'
        const formData = new FormData()
        formData.append('file', file)
        axios.post(props.action, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((res) => {
          console.log(res.data)
          fileStatus.value = 'success'
          emit('file-uploaded', res.data)
        }).catch((err) => {
          fileStatus.value = 'error'
          emit('file-uploaded-error', { err })
        }).finally(() => {
          if (fileInput.value) {
            // 清空 input 的值
            fileInput.value.value = ''
          }
        })
      }
    }
    return {
      fileInput,
      trigerUpload,
      fileStatus,
      handleFileChange
    }
  }
})
</script>
