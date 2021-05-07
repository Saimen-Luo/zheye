import { createStore } from 'vuex'
import axios from 'axios'
export interface IUser {
  isLogin: boolean,
  id?: number,
  name?: string,
  columnId?: number
}

interface IImage {
  _id?: string,
  url?: string,
  createdAt?: string
}

export interface IColumn {
  _id: string;
  title: string;
  avatar?: IImage;
  description: string;
}
export interface IPost {
  id: number;
  title: string;
  content: string;
  image?: string;
  createdAt: string;
  columnId: number;
}
export interface IGlobalData {
  columns: IColumn[],
  posts: IPost[],
  user: IUser
}

const store = createStore<IGlobalData>({
  state: {
    columns: [],
    posts: [],
    user: { isLogin: true, name: 'Luo', id: 1, columnId: 1 }
  },
  mutations: {
    login (state) {
      state.user = { ...state.user, isLogin: true, name: 'Luo' }
    },
    createPost (state, newPost) {
      state.posts.push(newPost)
    },
    fetchColumns (state, rawData) {
      state.columns = rawData.data.list
    }
  },
  actions: {
    fetchColumns (context) {
      axios.get('/columns').then((res) => {
        context.commit('fetchColumns', res.data)
      })
    }
  },
  getters: {
    getColumnById (state) {
      // 返回函数
      return (id: string) => state.columns.find(c => c._id === id)
    },
    getPostsByCid (state) {
      return (cid: number) => state.posts.filter(p => p.columnId === cid)
    }
  }
})

export default store
