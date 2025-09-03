<template>
    <div class="ui-fas">
        <el-button :disabled="disabled"
                   v-model="name"
                   v-popover:popover
                   clearable>
            <i :class="prefixIcon"/>
        </el-button>
        <!-- 弹出框 -->
        <el-popover :disabled="disabled" ref="popover" :placement="placement" popper-class="el-icon-popper"
                    :width="width" v-model="visible" trigger="click">
            <el-scrollbar tag="div" wrap-class="el-select-dropdown__wrap" view-class="el-select-dropdown__list"
                          class="is-empty">
                <ul class="fas-icon-list">
                    <li v-for="(item, index) in iconList" :key="index" @click="selectedIcon(item)">
                        <i :class="item" :title="item"/>
                    </li>
                </ul>
            </el-scrollbar>
        </el-popover>
    </div>
</template>

<script>
    import iconList from './iconList'
    import {off, on} from "./utils/dom"

    export default {
        name: "iconPicker",
        props: {
            // 是否禁用
            disabled: {
                type: Boolean,
                // false
                default() {
                    return false
                }
            },
            // 弹出框位置
            placement: {
                type: String,
                //  bottom
                default() {
                    return 'bottom'
                }
            },
            value: {
                type: String,
                default() {
                    return ''
                }
            },
            width: {
                type: Number,
                default() {
                    return 270
                }
            }
        },
        data() {
            return {
                iconList: iconList,
                visible: false, // popover v-model
                prefixIcon: 'el-icon-edit',
                name: ''
            }
        },
        methods: {
            selectedIcon(item) {
                this.visible = false
                this.name = item
                this._emitFun()
            },

            // 点击控件外，判断是否隐藏弹出框
            _popoverHideFun(e) {
                this.visible = false
            },
            // 判断类型，抛出当前选中id
            _emitFun() {
                this.$emit('change', this.name)
                this._updatePopoverLocationFun()
            },
            // 更新popover位置
            _updatePopoverLocationFun() {
                // dom高度还没有更新，做一个延迟
                setTimeout(() => {
                    this.$refs.popover.updatePopper()
                }, 50)
            }
        },
        mounted() {
            this.$nextTick(() => {
                on(document, 'mouseup', this._popoverHideFun)
            })
        },
        beforeDestroy() {
            off(document, 'mouseup', this._popoverHideFun)
        },
        created() {
            this.prefixIcon = this.value ? this.value : 'el-icon-edit'
            this.name = this.value
        },
        watch: {
            name: function (val) {
                setTimeout(() => {
                    this.prefixIcon = val ? val : 'el-icon-edit'
                }, 200)
            },
            value: function (val) {
                setTimeout(() => {
                    this.name = val
                }, 200)
            }
        }
    }
</script>

<style>
    [class^="fa"] {
        vertical-align: middle;
        text-align: center;
    }

    .el-submenu [class^="fa"] {
        margin-right: 5px;
        width: 24px;
    }

    .fas-icon-list {
        list-style-type: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }

    .ui-fas .el-input__inner {
        cursor: pointer;
    }

    .fas-icon-list li {
        width: 30px;
        height: 30px;
        margin: 5px;
    }

    .fas-icon-list li i {
        font-size: 20px;
        cursor: pointer;
    }

    .el-icon-popper {
        max-height: 400px;
        overflow: auto;
        overflow-x: hidden;
        overflow-y: hidden;
    }

    .el-icon-popper[x-placement^='bottom'] {
        margin-top: 5px;
    }
</style>
