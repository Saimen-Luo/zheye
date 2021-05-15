<template>
  <div class="create-post-page">
    <h4>{{ isEditMode ? "编辑文章" : "新建文章" }}</h4>
    <Uploader
      action="/upload"
      :beforeUpload="beforeUpload"
      @file-uploaded="onFileUploaded"
      class="d-flex align-items-center justify-content-center bg-light text-secondary w-100 my-4"
      :uploaded="uploadedData"
    >
      <h2>点击上传头图</h2>
      <!-- <template #loading>
        <div class="d-flex">
          <div class="spinner-border text-secondary" role="status">
            <span class="visually-hidden">Loading</span>
          </div>
        </div>
      </template> -->
      <template #uploaded="slotProps">
        <!-- 上传成功展示图片 -->
        <img :src="slotProps.uploadData.data.url" alt="upload-image" />
      </template>
    </Uploader>
    <validate-form @form-submit="onFormSubmit">
      <div class="mb-3">
        <label class="form-label">文章标题：</label>
        <validate-input
          :rules="titleRules"
          v-model="titleVal"
          placeholder="请输入文章标题"
          type="text"
        />
      </div>
      <div class="mb-3">
        <label class="form-label">文章详情：</label>
        <validate-input
          tag="textarea"
          rows="10"
          placeholder="请输入文章详情"
          :rules="contentRules"
          v-model="contentVal"
        />
      </div>
      <template #submit>
        <button class="btn btn-primary btn-large">
          {{ isEditMode ? "更新文章" : "发表文章" }}
        </button>
      </template>
    </validate-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'

import ValidateInput, { IRule } from '../components/ValidateInput.vue'
import ValidateForm from '../components/ValidateForm.vue'
import Uploader from '../components/Uploader.vue'
import { IGlobalData, IPost, IResponse, IImage } from '../store'
import createMessage from '../components/createMessage'
import { beforeUploadCheck } from '../Helper'

export default defineComponent({
  name: 'CreatePost',
  components: {
    ValidateInput,
    ValidateForm,
    Uploader
  },
  setup () {
    const uploadedData = ref()
    const store = useStore<IGlobalData>()
    const router = useRouter()
    const route = useRoute()
    // !! 转换为布尔值
    const isEditMode = !!route.query.id
    const titleVal = ref('')
    let imageId = ''
    const titleRules: IRule[] = [
      { type: 'required', message: '文章标题不能为空' }
    ]
    const contentVal = ref('')
    const contentRules: IRule[] = [
      { type: 'required', message: '文章详情不能为空' }
    ]
    onMounted(() => {
      if (isEditMode) {
        store.dispatch('fetchPost', route.query.id).then((rawDate: IResponse<IPost>) => {
          const currentPost = rawDate.data
          if (currentPost.image) {
            uploadedData.value = { data: currentPost.image }
          }
          titleVal.value = currentPost.title
          // currentPost.content may be undefined
          contentVal.value = currentPost.content || ''
        })
      }
    })
    const onFormSubmit = (result: boolean) => {
      // all rules pass
      if (result) {
        const { column, _id } = store.state.user
        // column may be undefined
        if (column) {
          const newPost: IPost = {
            title: titleVal.value,
            content: contentVal.value,
            column,
            author: _id
          }
          if (imageId) {
            newPost.image = imageId
          }
          const actionName = isEditMode ? 'updatePost' : 'createPost'
          const sendData = isEditMode ? {
            id: route.query.id,
            payload: newPost
          } : newPost
          store.dispatch(actionName, sendData).then(() => {
            const timeout = 1000
            createMessage('success', '发表成功，跳转到专栏...', timeout)
            setTimeout(() => {
              router.push({ name: 'column', params: { id: column } })
            }, timeout)
          })
        }
      }
    }
    const beforeUpload = (file: File) => {
      const result = beforeUploadCheck(file, { format: ['image/jpeg', 'image/png'], size: 1 })
      const { passed, error } = result
      if (error === 'format') {
        createMessage('error', '上传图片只能是 JPG/PNG 格式!')
      }
      if (error === 'size') {
        createMessage('error', '上传图片大小不能超过 1Mb')
      }
      return passed
    }

    const onFileUploaded = (rawData: IResponse<IImage>) => {
      // createMessage('success', `上传图片ID ${rawData.data._id}`)
      if (rawData.data._id) {
        imageId = rawData.data._id
      }
    }

    return {
      titleRules,
      titleVal,
      contentVal,
      contentRules,
      onFormSubmit,
      beforeUpload,
      onFileUploaded,
      uploadedData,
      isEditMode
    }
  }
})
</script>
<style>
.create-post-page .file-upload-container {
  height: 200px;
  cursor: pointer;
  overflow: hidden;
}
.create-post-page .file-upload-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.uploaded-area {
  position: relative;
}
.uploaded-area:hover h3 {
  display: block;
}
.uploaded-area h3 {
  display: none;
  position: absolute;
  color: #999;
  text-align: center;
  width: 100%;
  top: 50%;
}
</style>
