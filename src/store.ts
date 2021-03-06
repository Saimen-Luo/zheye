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

interface ILoadColumn {
  id: string,
  total: number,
  currentPage: number
}
export interface IGlobalData {
  error: IGlobalError,
  token: string,
  loading: boolean,
  columns: { data: IArrLikeObj<IColumn>, currentPage: number, total: number },
  posts: { data: IArrLikeObj<IPost>, loadedColumns: IArrLikeObj<ILoadColumn> },
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
    columns: { data: {}, currentPage: 0, total: 0 },
    posts: { data: {}, loadedColumns: {} },
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
      const { data } = state.columns
      const { list, count, currentPage } = rawData.data
      state.columns = {
        data: { ...data, ...arrToObj(list) },
        total: count,
        currentPage: currentPage * 1
      }
    },
    fetchColumn (state, rawData) {
      state.columns.data[rawData.data._id] = rawData.data
    },
    fetchPosts (state, { data: rawData, extraData: columnId }) {
      const { list, count, currentPage } = rawData.data
      state.posts.data = { ...state.posts.data, ...arrToObj(list) }
      state.posts.loadedColumns[columnId] = {
        id: columnId,
        currentPage,
        total: count
      }
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
      state.user = { isLogin: false }
      state.token = ''
      localStorage.removeItem('token')
      delete axios.defaults.headers.common.Authorization
    }
  },
  actions: {
    fetchColumns ({ state, commit }, params = {}) {
      const { currentPage = 1, pageSize = 5 } = params
      // ???????????? currentPage ???????????????????????????
      if (state.columns.currentPage < currentPage) {
        return asyncAndCommit(`/columns?currentPage=${currentPage}&pageSize=${pageSize}`, 'fetchColumns', commit)
      }
    },
    fetchColumn ({ state, commit }, cid) {
      if (!state.columns.data[cid]) {
        return getAndCommit(`/columns/${cid}`, 'fetchColumn', commit)
      }
    },
    fetchPosts ({ state, commit }, params = {}) {
      const { loadedColumns } = state.posts
      const { currentId, currentPage = 1, pageSize = 5 } = params
      if (!loadedColumns[currentId] || loadedColumns[currentId].currentPage < currentPage) {
        return asyncAndCommit(`/columns/${currentId}/posts?currentPage=${currentPage}&pageSize=${pageSize}`, 'fetchPosts', commit, { method: 'get' }, currentId)
      }
    },
    fetchPost ({ state, commit }, pid) {
      const currentPost = state.posts.data[pid]
      if (!currentPost || !currentPost.content) {
        return getAndCommit(`/posts/${pid}`, 'fetchPost', commit)
      } else {
        // createPost ????????????????????? promise
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
      // ????????????
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
