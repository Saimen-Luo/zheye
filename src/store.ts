import { createStore, Commit } from 'vuex'
import axios, { AxiosRequestConfig } from 'axios'

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

export interface IGlobalData {
  error: IGlobalError,
  token: string,
  loading: boolean,
  columns: IColumn[],
  posts: IPost[],
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

const asyncAndCommit = async (url: string, mutationName: string, commit: Commit, config: AxiosRequestConfig = { method: 'get' }) => {
  const { data } = await axios(url, config)
  commit(mutationName, data)
  return data
}

const store = createStore<IGlobalData>({
  state: {
    error: { status: false },
    token: localStorage.getItem('token') || '',
    loading: false,
    columns: [],
    posts: [],
    user: { isLogin: false }
  },
  mutations: {
    // login (state) {
    //   state.user = { ...state.user, isLogin: true, name: 'Luo' }
    // },
    createPost (state, newPost) {
      state.posts.push(newPost)
    },
    fetchColumns (state, rawData) {
      state.columns = rawData.data.list
    },
    fetchColumn (state, rawData) {
      state.columns = [rawData.data]
    },
    fetchPosts (state, rawData) {
      state.posts = rawData.data.list
    },
    fetchPost (state, rawData) {
      state.posts = [rawData.data]
    },
    updatePost (state, { data }) {
      state.posts = state.posts.map(post => {
        if (post._id === data._id) {
          return data
        }
        return post
      })
    },
    deletePost (state, { data }) {
      state.posts = state.posts.filter(post => {
        return post._id !== data._id
      })
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
    fetchColumns ({ commit }) {
      return getAndCommit('/columns', 'fetchColumns', commit)
    },
    fetchColumn ({ commit }, cid) {
      return getAndCommit(`/columns/${cid}`, 'fetchColumn', commit)
    },
    fetchPosts ({ commit }, cid) {
      return getAndCommit(`/columns/${cid}/posts`, 'fetchPosts', commit)
    },
    fetchPost ({ commit }, pid) {
      return getAndCommit(`/posts/${pid}`, 'fetchPost', commit)
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
    getColumnById (state) {
      // 返回函数
      return (id: string) => state.columns.find(c => c._id === id)
    },
    getPostsByCid (state) {
      return (cid: string) => state.posts.filter(p => p.column === cid)
    },
    getCurrentPost (state) {
      return (pid: string) => state.posts.find(p => p._id === pid)
    }
  }
})

export default store
