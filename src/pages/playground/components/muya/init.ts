export enum stateDocText {
  '草稿保存失败' = -1,
  '自动保存已开启',
  '草稿保存中...',
  '草稿已保存',
  '草稿加载成功',
}
export function initData() {
  return {
    loading: true,
    fileInfo: {
      name: '新文件',
    },
    wordCount: 0,
    stateDoc: 0,
    markdown: '',
  }
}
