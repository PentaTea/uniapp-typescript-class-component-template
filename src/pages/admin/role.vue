<template>
  <AdminWallpaper>
    <unicloud-db
      #default="{ data, loading }"
      collection="uni-id-roles,uni-id-permissions"
      field="role_id,role_name,permission{permission_name},comment,create_date"
      style="height: 100%"
      :page-size="size"
      page-data="replace"
      getcount
      :where="log(where)"
      ref="db"
    >
      <UniList
        :init="init"
        :data="data"
        :schema="schema"
        :loading="loading"
        input:角色
        @fetch="
          (e) => {
            size = e.pages.size
            current = e.pages.current
            getWhere(e.params)
          }
        "
        ref="list"
        expand
      >
        <template #expand="{ row }">
          <div class="padding padding-lr-xl">
            <pre v-html="obj2html(row)"></pre>
          </div>
        </template>
        <template #create_date="{ value }">{{ value ? app.time(value).fromNow() : '' }}</template>
      </UniList>
    </unicloud-db>
  </AdminWallpaper>
</template>

<script lang="ts">
import { Vue, Component, Watch } from '@app/mixins'
import AdminWallpaper from './conponents/AdminWallpaper.vue'
import UniList from './conponents/UniList/index.vue'
import stringifyObject from 'stringify-object'
import hanabi from '@app/common/hanabi'

import roleAdd from './roleAdd.json'
import userFromEdit from './userEdit.json'
@Component({
  components: {
    AdminWallpaper,
    UniList,
  },
})
export default class extends Vue {
  size = 10
  current = 1
  @Watch('current') fetch() {
    this.$refs.db &&
      this.$refs['db']['loadData']({
        current: this.current,
      })
  }
  where = 'delete_at==null'
  displayDelete = false
  getWhere(e) {
    const arr = this.displayDelete ? [] : ['delete_at==null']
    Object.entries(e || {}).forEach(([k, v]: [any, any]) => {
      if (this.is.empty(v)) return
      // arr.push(
      //   Array.isArray(v)
      //     ? `${k}.role_id==${v.map((e) => `'${e}'`).join(',')}`
      //     : `/${v}/i.test(${k})`
      // )
      // arr.push(`${k} in [${v.map((e) => `'${e}'`).join(',')}]`)
      switch (k) {
        case 'role':
          return v.forEach((e) => arr.push(`role.role_id=='${e}'`))
        default:
          return arr.push(`/${v}/i.test(${k})`)
      }
    })
    this.where = arr.join('&&')
  }

  init(page) {
    return {
      actionStyle: {
        删除: { type: 'warning' },
        永久删除: { type: 'danger' },
      },
      action: {
        编辑: {
          show: ({ row }) => !row.delete_at,
          fn: ({ row: { ...row } }) => {
            if (row.username_raw) row.username = row.username_raw
            if (row.role)
              row.role = row.role.map((e) => {
                console.log(e, e.role_id)

                return e.role_id
              })
            console.log(row)
            page
              .dialog({
                form: userFromEdit,
                data: row,
                use: {
                  role: '角色',
                },
              })
              .then((res) => ({ id: row._id, ...res }))
              .then((res) => app.cloud.user.updateUser(res))
              .then(() => page.reload())
          },
        },
        删除: {
          show: ({ row }) => !row.delete_at,
          fn: ({ row }) => {
            page
              .dialog({ text: '确认删除?' })
              .then(() => app.db.collection('uni-id-users').doc(row._id).remove())
              .then(() => page.reload())
          },
        },
        永久删除: {
          show: ({ row }) => !!row.delete_at,
          fn: ({ row }) => {
            page
              .dialog({ text: '操作不可逆,确认永久删除?' })
              .then(() => app.db.collection('uni-id-users').doc(row._id).remove())
              .then(() => page.reload())
          },
        },
      },
      headerStyle: {
        '删除*': { type: 'warning' },
        '永久删除*': { type: 'danger' },
      },
      header: {
        删除选中内容: {
          show: (selection) =>
            selection && selection.length && !selection.every((e) => e.delete_at),
          fn(selection) {
            const $ = uniCloud.database().command
            page.dialog({ text: '确认删除?' }).then(() =>
              app.db
                .collection('uni-id-users')
                .where({ _id: $.or(selection.filter((e) => !e.delete_at).map((e) => $.eq(e._id))) })
                .remove()
                .then(() => page.reload())
            )
          },
        },
        永久删除选中内容: {
          show: (selection) => selection && selection.length && selection.every((e) => e.delete_at),
          fn(selection: any[]) {
            const $ = uniCloud.database().command
            page.dialog({ text: '操作不可逆,确认永久删除?' }).then(() =>
              app.db
                .collection('uni-id-users')
                .where({ _id: $.or(selection.map((e) => $.eq(e._id))) })
                .remove()
                .then(() => page.reload())
            )
          },
        },
        添加用户: () =>
          page
            .dialog({
              form: roleAdd,
              use: {
                permission: '权限',
              },
            })
            .then((res) => app.cloud.user.registerUser(res))
            .then(() => page.reload()),
      },
    }
  }
  schema = {
    $selection: '多选',
    role_id: '角色',
    role_name: '名称',
    permission: '权限',
    comment: '注释',
    create_date: '创建时间',
  }
  obj2html(data) {
    return hanabi(
      stringifyObject(data, {
        indent: '  ',
      })
    )
  }
}

enum Gender {
  未知 = 0,
  男,
  女,
}
</script>

<style lang="scss" scoped>
.role {
  display: flex;
  flex-wrap: wrap;

  > * {
    margin: 5px;
  }

  .admin span {
    color: #f16262;
    background-color: #f9ebeb;
    border-color: #f3d8d8;
  }
}
</style>
