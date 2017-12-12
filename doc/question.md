# 成果及问题   
* 仓库名为method-override   
* 通过本次代码的阅读，学习了如何利用中间件改写默认的方法   
* 本项目依赖第三方数据库，需要请求methods，debug，parseurl，以及query模块来完成方法的重载    
* 代码中着重强调getter函数，它可以编辑成自定义的function或者string    
* 使用trim，tostring等方法，来确定要修改的头部    
* 我认为的难点是改写方法是需要判断字符串参数是否以'x-'开头，从而进行从url中获取或者从http头部获取的选择    
* 代码中中有一个没有匹配过的}，导致测试时出现问题    
* 调试运行：   
![Image]https://github.com/yijieliu/method-override/edit/master/doc/9731}IL(ORB}LE97O([YL2Q.png)   
![Image]https://github.com/yijieliu/method-override/edit/master/doc/5I%3VZ9WT]H~XJ3}2_6F(M9.png)   