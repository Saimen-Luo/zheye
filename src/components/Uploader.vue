<template>
  <div class="file-upload">
    <div class="file-upload-container" @click.prevent="trigerUpload">
      <slot v-if="fileStatus === 'loading'" name="loading">
        <button class="btn btn-primary">正在上传...</button>
      </slot>
      <slot
        v-else-if="fileStatus === 'success'"
        name="uploaded"
        :uploadData="uploadData"
      >
        <button class="btn btn-primary">上传成功</button>
      </slot>
      <slot v-else>
        <button class="btn btn-primary">点击上传</button>
      </slot>
    </div>
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
    const uploadData = ref()
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
          // console.log(res.data)
          fileStatus.value = 'success'
          uploadData.value = res.data
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
      handleFileChange,
      uploadData
    }
  }
})
</script>
