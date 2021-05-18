import { createStore, Commit } from 'vuex'
import axios, { AxiosRequestConfig } from 'axios'

import { arrToObj, objToArr } from './Helper'

export interface IResponse<P> {
  code: number,
  msg: string,
  data: P
}

export interface IImage {
  _id?: string,
  url?: string,
  createdAt?: string,
  fitUrl?: string
}

export interface IUser {
  avatar?: IImage;
  description?: string,
  isLogin: boolean,
  _id?: string,
  nickName?: string,
  column?: string,
  email?: string
}
export interface IColumn {
  _id: string;
  title: string;
  avatar?: IImage;
  description: string;
}
export interface IPost {
  _id?: string;
  title: string;
  excerpt?: string,
  content?: string;
  image?: IImage | string;
  createdAt?: string;
  column: string;
  author?: string | IUser;
}

export interface IGlobalError {
  status: boolean
  message?: string
}

interface IArrLikeObj<T> {
  [id: string]: T
}
export interface IGlobalData {
  error: IGlobalError,
  token: string,
  loading: boolean,
  columns: { data: IArrLikeObj<IColumn>, isLoaded: boolean },
  posts: { data: IArrLikeObj<IPost>, loadedColumns: string[] },
  user: IUser
}

const getAndCommit = async (url: string, mutationName: string, commit: Commit) => {
  const { data } = await axios.get(url)
  commit(mutationName, data)
  return data
}

const postAndCommit = async (url: string, mutationName: string, commit: Commit, payload: any) => {
  const { data } = await axios.post(url, payload)
  commit(mutationName, data)
  return data
}

const asyncAndCommit = async (url: string, mutationName: string, commit: Commit, config: AxiosRequestConfig = { method: 'get' }, extraData?: any) => {
  const { data } = await axios(url, config)
  if (extraData) {
    commit(mutationName, { data, extraData })
  } else {
    commit(mutationName, data)
  }
  return data
}

const store = createStore<IGlobalData>({
  state: {
    error: { status: false },
    token: localStorage.getItem('token') || '',
    loading: false,
    columns: { data: {}, isLoaded: false },
    posts: { data: {}, loadedColumns: [] },
    user: { isLogin: false }
  },
  mutations: {
    // login (state) {
    //   state.user = { ...state.user, isLogin: true, name: 'Luo' }
    // },
    createPost (state, newPost) {
      state.posts.data[newPost._id] = newPost
    },
    fetchColumns (state, rawData) {
      state.columns.data = arrToObj(rawData.data.list)
      state.columns.isLoaded = true
    },
    fetchPosts (state, { data: rawData, extraData: columnId }) {
      state.posts.data = { ...state.posts.data, ...arrToObj(rawData.data.list) }
      state.posts.loadedColumns.push(columnId)
    },
    fetchPost (state, rawData) {
      state.posts.data[rawData.data._id] = rawData.data
    },
    updatePost (state, { data }) {
      state.posts.data[data._id] = data
    },
    deletePost (state, { data }) {
      delete state.posts.data[data._id]
    },
    setLoading (state, status) {
      state.loading = status
    },
    login (state, rawData) {
      const { token } = rawData.data
      state.token = token
      localStorage.setItem('token', token)
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
    },
    fetchCurrentUser (state, rawData) {
      state.user = { isLogin: true, ...rawData.data }
    },
    setError (state, e: IGlobalError) {
      state.error = e
    },
    logout (state) {
      state.token = ''
      localStorage.removeItem('token')
      delete axios.defaults.headers.common.Authorization
    }
  },
  actions: {
    fetchColumns ({ state, commit }) {
      // 只在 columns 未获取时发送请求
      if (!state.columns.isLoaded) {
        return getAndCommit('/columns', 'fetchColumns', commit)
      }
    },
    fetchPosts ({ state, commit }, cid) {
      if (!state.posts.loadedColumns.includes(cid)) {
        return asyncAndCommit(`/columns/${cid}/posts`, 'fetchPosts', commit, { method: 'get' }, cid)
      }
    },
    fetchPost ({ state, commit }, pid) {
      const currentPost = state.posts.data[pid]
      if (!currentPost || !currentPost.content) {
        return getAndCommit(`/posts/${pid}`, 'fetchPost', commit)
      } else {
        // createPost 编辑时需要返回 promise
        return Promise.resolve({ data: currentPost })
      }
    },
    updatePost ({ commit }, { id, payload }) {
      return asyncAndCommit(`/posts/${id}`, 'updatePost', commit, {
        method: 'patch',
        data: payload
      })
    },
    deletePost ({ commit }, id) {
      return asyncAndCommit(`/posts/${id}`, 'deletePost', commit, {
        method: 'delete'
      })
    },
    login ({ commit }, payload) {
      return postAndCommit('/user/login', 'login', commit, payload)
    },
    createPost ({ commit }, payload) {
      return postAndCommit('/posts', 'createPost', commit, payload)
    },
    fetchCurrentUser ({ commit }) {
      return getAndCommit('/user/current', 'fetchCurrentUser', commit)
    },
    loginAndFetchUser ({ dispatch }, payload) {
      return dispatch('login', payload).then(() => {
        return dispatch('fetchCurrentUser')
      })
    }
  },
  getters: {
    getColumns (state) {
      return objToArr(state.columns.data)
    },
    getColumnById (state) {
      // 返回函数
      return (id: string) => state.columns.data[id]
    },
    getPostsByCid (state) {
      return (cid: string) => objToArr(state.posts.data).filter(p => p.column === cid)
    },
    getCurrentPost (state) {
      return (pid: string) => state.posts.data[pid]
    }
  }
})

export default store
