# method-override
  当客户端不支持你使用PUT或者DELETE等HTTP方法时，你可以使用它来解决 
# Install   
  这是通过npm注册表的可使用的node.js模块，通过npm安装指令可以完成安装。   
  
  ```$ npm install method-override ```  
 # API        
    记住这个模块在那些需要知道请求方法的模块之前使用（例如，必须在csurf模块之前使用）   
 ##  methodOverride(getter, options)    
 
 创建一个新的中间件函数及设置新的属性值，用来重载请求改写的方法。这个新值来自于提供的getter。    
 * getter -getter用于为请求查询请求重载的方法（默认：X-HTTP-Method-Override）    
 * options.methods-查看没有方法重载的值，必须有允许的原始请求（默认：['POST']）   
 如果node代码支持新建的方法，那么req.method将代替原始的值，之前原始的req.method将存储在req.originalMethod中。    
 
 ## getter    
 这是从请求得到重载方法值的方法。如果提供了一个函数， req作为第一个参数传递，res作为第二个参数，该方法被返回。如果提供的是一个字符串，该字符串是通过下列规则查找方法 ：    
 * 如果这个字符串以X-开头，它会作为头部名而去这个头部会用于方法重载。如果该请求包含多次同中头部，则使用第一次的头部。   
 * 所有其他字符串作为url查询支付串的键值。    
 
 ## options.methods   
 这里无论什么方法的格式的请求必须是为了检查方法重载的值。默认方法只有POST存在，更多的方法必须在这里指定。当请求在缓存时，可能会引起安全问题，和发生怪异行为。value值应该是大写的数组。null可以被指定为允许所有方法。   
 
 # Examples   
 
 ## override using a header   
 使用头部去重载一个方法，在重载函数中指定头部名作为字符串参数。然后使用call函数，发送POST请求到url，在URL中获得重载方法的值。这种方式通常结合XMLHttpRequest使用，否则不支持你正在使用的方法。   
 
```var express = require('express')
var methodOverride = require('method-override')
var app = express()

// override with the X-HTTP-Method-Override header in the request
app.use(methodOverride('X-HTTP-Method-Override'))
```   


使用XMLHttpRequest来使用头部重载：  

```var xhr = new XMLHttpRequest()
xhr.onload = onload
xhr.open('post', '/resource', true)
xhr.setRequestHeader('X-HTTP-Method-Override', 'DELETE')
xhr.send()

function onload () {
  alert('got response: ' + this.responseText)
}
```   

## override using a query value   
使用查询字符串的值来重载方法，指定查询字符串的键作为methodOverride函数的字符串参数。然后把重载方法作为值发送post请求到url，查询字符串作为键。这种方法使用时通常与HTML中的表单元素结合。    

```var express = require('express')
var methodOverride = require('method-override')
var app = express()

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))
```   

和HTML中的<form>结合使用的例子：   
```<form method="POST" action="/resource?_method=DELETE">
  <button type="submit">Delete resource</button>
</form>
```   
## multiple format support（多种格式支持）    
```var express = require('express')
var methodOverride = require('method-override')
var app = express()

// override with different headers; last one takes precedence
app.use(methodOverride('X-HTTP-Method'))          // Microsoft
app.use(methodOverride('X-HTTP-Method-Override')) // Google/GData
app.use(methodOverride('X-Method-Override'))      // IBM    
```
## custom logic   
你可以通过getter实现多种函数的自定义编辑。以下的编辑方式可以在req.body中出现。    
```var bodyParser = require('body-parser')
var express = require('express')
var methodOverride = require('method-override')
var app = express()

// NOTE: when using req.body, you must fully parse the request body
//       before you call methodOverride() in your middleware stack,
//       otherwise req.body will not be populated.
app.use(bodyParser.urlencoded())
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))
```   

查询重载和HTML<form>结合的例子：   
  ```<!-- enctype must be set to the type you will parse before methodOverride() -->
<form method="POST" action="/resource" enctype="application/x-www-form-urlencoded">
  <input type="hidden" name="_method" value="DELETE">
  <button type="submit">Delete resource</button>
</form>   
  ```   
   
   
##  License   
  MIT
