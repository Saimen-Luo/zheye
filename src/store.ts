import { createStore } from 'vuex'

import { testColumns, testPosts, IColumn, IPost } from './testData'

interface IUser {
  isLogin: boolean,
  id?: number,
  name?: string
}

export interface IGlobalData {
  columns: IColumn[],
  posts: IPost[],
  user: IUser
}

const store = createStore<IGlobalData>({
  state: {
    columns: testColumns,
    posts: testPosts,
    user: { isLogin: false }
  }
})

export default store