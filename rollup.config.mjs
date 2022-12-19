/*
 * @Author: kim
 * @Date: 2022-12-18 17:26:06
 * @Description: 配置文件
 */
import fs from 'fs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import babel from '@rollup/plugin-babel'
import del from 'rollup-plugin-delete'
import html from '@rollup/plugin-html'
import replace from '@rollup/plugin-replace'
import postcss from 'rollup-plugin-postcss'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

const templateHtml = fs.readFileSync('./pubilc/index.html', {
  encoding: 'utf-8',
})

const isProd = process.env.NODE_ENV === 'production'

// 通用的插件
const basePlugins = [
  del({
    targets: ['dist'], // 删除打包目录文件
    runOnce: !isProd,
  }),
  html({
    title: 'rollup-react-template',
    attributes: {
      link: {
        stylesheet: './index.css',
      },
    },

    template: ({ attributes, bundle, files, publicPath, title }) => {
      const fileStr = {}
      for (const attr in attributes) {
        let res = ''
        for (const key in attributes[attr]) {
          const value = attributes[attr][key]
          if (attr === 'link') {
            res = res.concat(`<link href='${value}' rel='${key}'></link>`)
            break
          }
        }
        fileStr[attr] = res
      }

      for (const key in files) {
        fileStr[key] = files[key].reduce((res, value) => {
          if (!value.isEntry) return res

          return res.concat(`<script src='./${value.fileName}'></script>`)
        }, '')
      }

      return templateHtml
        .replace('${scripts}', fileStr['js'] || '')
        .replace('${links}', fileStr['link'] || '')
        .replace('${title}', title || '')
    },
  }),
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV), // 处理 process is not defined
  }),
  postcss({
    extract: true,
    minimize: true,
  }),
  commonjs(),
  nodeResolve(),
  terser(),
  babel(),
  typescript(),
]
// 开发环境需要使用的插件
const devPlugins = [
  serve({
    open: true,
    contentBase: 'dist',
    port: 8080,
  }),
  livereload({
    watch: 'dist',
    verbose: true,
  })
]
// 生产环境需要使用的插件
const prodPlugins = []

const plugins = [...basePlugins].concat(isProd ? prodPlugins : devPlugins)

export default {
  input: 'src/index.tsx',
  output: {
    name: 'r',
    file: 'dist/index.js',
    format: 'umd',
    sourcemap: !isProd
  },
  plugins
}
