/*!
 * method-override
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict'  //使用严格模式

/**
 * Module dependencies.   依赖的模块
 */

var debug = require('debug')('method-override')  //请求debug模块，输出method-override中的信息
var methods = require('methods')  //请求methods模块
var parseurl = require('parseurl')
var querystring = require('querystring')  //请求querystring，parseurl模块，用来查询字符串中的参数部分，并实现url参数字符与参数对象的相互转化
var vary = require('vary')  //响应头包含vary字段，且vary的内容对象含有User-Agent，格式为Vary:User-Adent,Cookie,进行方法重写之后，缓存服务器按照改写的目的方法分类缓存，可以将X-HEADER=REWRITE添加到vary中

/**
 * Method Override:
 *
 * Provides faux HTTP method support.
 *
 * Pass an optional `getter` to use when checking for
 * a method override.
 *
 * A string is converted to a getter that will look for
 * the method in `req.body[getter]` and a function will be
 * called with `req` and expects the method to be returned.
 * If the string starts with `X-` then it will look in
 * `req.headers[getter]` instead.
 *
 * The original method is available via `req.originalMethod`.
 *
 * @param {string|function} [getter=X-HTTP-Method-Override]
 * @param {object} [options]
 * @return {function}
 * @api public
 */   
 //string：以X-开头，键值对在请求头部req.header中设置   
 //string：不是以X-开头，键值对在请求路径req.url中设置    
 //参数类型是函数和字符串    
 //参数类型是对象，返回函数对象   
 

module.exports = function methodOverride (getter, options) {
  var opts = options || {}
   //重构函数有getter和options两个参数，其中getter可以是自定义的function，string；options指定需要改写的方法
  // get the getter fn    
  //通过一个选择表达式确定get特人的数据类型，创建请求数据重载的方法
  
  var get = typeof getter === 'function'
    ? getter
    : createGetter(getter || 'X-HTTP-Method-Override')

  // get allowed request methods to examine   
  //没有要请求的方法就是使用'POST'方法，否则使用要修改的方法，通过回调函数发送请求，得到要修改的方法
  var methods = opts.methods === undefined
    ? ['POST']
    : opts.methods

  return function methodOverride (req, res, next) {
    var method
    var val

    req.originalMethod = req.originalMethod || req.method

    // validate request is an allowed method    
    //if判断该请求是否属于需要被修改的范围
    if (methods && methods.indexOf(req.originalMethod) === -1) {
      return next()
    }   
    //获得改写的目的方法（返回method的数据类型是否是数组）

    val = get(req, res)
    method = Array.isArray(val)
      ? val[0]
      : val

    // replace    
    // 如果方法存在，且属于node中支持的方法，请求的方法可以替换，并且方法要大写
    if (method !== undefined && supports(method)) {
      req.method = method.toUpperCase()
      debug('override %s as %s', req.originalMethod, req.method)
    }

    next()
  }
}

/**
 * Create a getter for the given string.
 */
//创建新的getter，截取字符串前两位，判断字符串是否以'X-'开头，返回不同的函数
function createGetter (str) {
  if (str.substr(0, 2).toUpperCase() === 'X-') {
    // header getter
    return createHeaderGetter(str)
  }

  return createQueryGetter(str)
}

/**
 * Create a getter for the given query key name.
 */
//方法一：从url里获取键值对，改写的目的方法。
function createQueryGetter (key) {
  return function (req, res) {
    var url = parseurl(req)   
    //把url字符串转换成对象返回
    var query = querystring.parse(url.query || '')    
    //把url上的参数串转换为数组对象
    return query[key]
  }
}

/**
 * Create a getter for the given header name.
 */
//从http头部获取改写的目的方法
function createHeaderGetter (str) {
  var name = str.toLowerCase()

  return function (req, res) {
    // set appropriate Vary header
    //设置适当的Vary的头部
    vary(res, str)

    // get header
    var header = req.headers[name]

    if (!header) {
      return undefined
    }

    // multiple headers get joined with comma by node.js core   
    //多种头部的nodejs代码通过逗号分隔
    var index = header.indexOf(',')

    // return first value   
    //判断是否存在value值，存在返回第一个value值    
    //trim去除字符串两端的空格
    return index !== -1
      ? header.substr(0, index).trim()
      : header.trim()
  }
}

/**
 * Check if node supports `method`.
 */
//不能改写成任意的方法，改写的方法必须是node支持的方法，否则无法修改成功
function supports (method) {
  return method &&
    typeof method === 'string' &&
    methods.indexOf(method.toLowerCase()) !== -1
}
