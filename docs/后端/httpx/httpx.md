### 一、简介

httpx是Python新一代的网络请求库，它包含以下特点

- 基于Python3的功能齐全的http请求模块
- 既能发送同步请求，也能发送异步请求
- 支持HTTP/1.1和HTTP/2
- 能够直接向WSGI应用程序或者ASGI应用程序发送请求



安装：

```shell
pip install httpx
```



### 二、基本使用

| 请求类型 | 发送方式          |
| -------- | ----------------- |
| GET      | httpx.get(...)    |
| POST     | httpx.post(...)   |
| PUT      | httpx.put(...)    |
| DELETE   | httpx.delete(...) |
| HEAD     | httpx.head(...)   |
| PATCH    | httpx.patch(...)  |
| OPTION   | httpx.option(...) |



```python
import httpx

# get 
response = httpx.get("https://www.test.com/s?wd=python")
params = { "wd": "python"}
response = httpx.get("https://www.test.com/s", params=params)

# post
# 如果服务端 接收 表单数据 方式
response = httpx.post("https://www.test.com/s", data={"name":"mrhow","age":18})
# 如果服务端 接收 JSON格式 方式
response = httpx.post("https://www.test.com/s", json={"name":"Mrhow","age":18})
# 如果服务端 接收 文件 方式
response = httpx.post("https://www.test.com/s", files={"file":open("test.txt",'rb')})
# 如果服务端 接收 字节流 方式
with open("test.txt","rb") as f:
    content = f.read()
response = httpx.post("https://www.test.com/s", content=content)

# 自定义请求头
response = httpx.get("https://www.test.com", headers={"User-Agent":"Chrome user agent"})

# 自定义Cookie

cookieDict = {"Session ID1":"0000001","Session ID2":"0000002"}
cookies = httpx.Cookies(cookieDict)
response = httpx.get("https://www.test.com", cookies = cookies)

```

### 三、 response 解析

**response.url** 

客户端请求的URL, 获取 URL 的每一个组成部分。

```python
response = httpx.get("https://wwww.baidu.com")
url = response.url
datas = {
    "scheme": url.scheme, # 例如 http, https
    "host": url.host, # 主机名 例如 http://www.example.com 其中 host == "www.example.com"
    "port": url.port, # 端口号
    "netloc": url.netloc, # netloc 是网络位置部分，它包括了主机名和可选的端口号。
    "path": url.path, # 例如 http://www.example.com/test 其中 path == "/test"
    "params": url.params, # 查询参数
}
```

**response.status_code**

状态码

```python
response = httpx.get("https://wwww.baidu.com")
if response.status_code != 200:
    raise ServerException("服务发生异常")
```

**reason_phrase**

状态码的文字描述

```python
response = httpx.get("https://wwww.baidu.com")
print(response.reason_phrase) # 例如 200 OK, 404 NOT FOUND
```

**response.headers**

响应头

```python
response = httpx.get("https://wwww.baidu.com")
print(response.headers["content-type"])
```

**response.content**

响应体，原始的字节流

**response.text**

对响应体进行解码所得到的字符串

**response.json**

对响应体进行JSON解析所得到的字典

```python
response = httpx.get("https://wwww.baidu.com")
datas = response.json()
```



### 四、重定向

重定向分为暂时性重定向和永久性重定向。

- 暂时性重定向：状态码为 302，比如我们要发表评论，但是没有登录，那么此时就会被重定向到登录页面；
- 永久性重定向：状态码为 301，比如我们访问一个已经废弃的域名，会被永久性重定向到新的域名。

```python
import httpx, requests

# 如果是 requests，那么会自动重定向
# 会被重定向到 https://www.taobao.com
response = requests.get("http://www.taobao.com")
# 而 response 也是重定向之后返回的响应
print(response.status_code)
"""
200
"""
# 但通过 response.history 可以获取重定向之前的响应
# 因为可能会被重定向多次，因此返回的是列表
print(response.history)
"""
[<Response [301]>]
"""
print(response.history[0].text)
"""
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html>
<head><title>301 Moved Permanently</title></head>
<body>
<h1>301 Moved Permanently</h1>
<p>The requested resource has been assigned a new permanent URI.</p>
<hr/>Powered by Tengine</body>
</html>
"""

# 但 httpx 不会自动重定向
response = httpx.get("http://www.taobao.com")
print(response.status_code)
print(response.history)
"""
301
[]
"""
# 如果希望重定向，那么需要指定一个参数
response = httpx.get("http://www.taobao.com",
                     follow_redirects=True)
print(response.status_code)
print(response.history)
"""
200
[<Response [301 Moved Permanently]>]
"""
```

requests 里面的参数叫 allow_redirects，默认为 True，表示允许重定向。如果不希望重定向，那么将其设置为 False；

httpx 里面的参数叫 follow_redirects，默认为 False，表示不进行重定向。如果希望重定向，那么将其设置为 True；



### 五、流式响应

对于一些服务端返回的响应体过于庞大的情况，使用流式传输解决。

```python
with httpx.stream("GET","https://www.example.com") as response:
    for data in response.iter_bytes(): # 流式传输响应二进制内容
        print(data)
    
    for data in response.iter_text(): # 流式传输响应文本内容
        print(data)
     
    for line in response.iter_lines(): # 逐行获取文本
        print(line)
    
    for chunk in response.iter_raw(): # 原始字节
        print(chunk)
```

以任何一种方式使用流式响应，则`response.content`和`response.text`属性将不可用.

通过分块读取，可以避免因响应体过大，而导致内存溢出。



### 六、超时控制

httpx 有很多优秀的特性，其中一个就是超时控制。httpx 为所有的网络操作都提供了一个合理的超时时间，如果连接没有正确地建立，那么 httpx 会及时地引发错误，而不会让开发者陷入长时间的等待。

```python
import httpx

# 默认超时时间是 5 秒，如果传入 None， 表示不设置超时时间
response = httpx.get("https://www.example.com", timeout=10)

# httpx 还支持更细粒度的控制时间
# 设置连接超时时间为10秒，读超时时间为5秒，写超时时间为6秒，其他超时时间为3秒
# 如果 connect、read、write 都不传，比如 Timeout(1)， 那么表示所有的超时时间都是相同的。
# 那么 timeout=Timeout(1) 和 timeout=1 是等价的
timeout = httpx.Timeout(3,connect=10,read=5,write=6)
response = httpx.get("https://www.example.com", timeout = timeout)

```

如果发生超时，则

- 连接超时：如果没有在规定时间内，和请求的主机建立套接字连接，我们就说连接超时了，会引发 ConnectTimeout 异常；

- 读超时：如果没有在规定时间内，接收到服务端返回的数据块（响应体的一个块），我们就说读超时了，会引发 ReadTimeout 异常。

- 写超时：如果没有在规定时间内，将数据块（请求体的一个块）发送给服务端，我们就说写超时了，会引发 WriteTimeout 异常。

读超时时间适用于 get、head 等请求，写超时时间适用于 post、put 等请求，连接超时时间适用于所有请求（因为不管什么请求都需要建立连接）。

### 七、Client

实际上，httpx 内部的 get、post 等函数 都是内部 先 实例化 一个 Client 对象， 然后调用其中的request方法。

所以当我们要多次向某个网址发请求（比如 get 请求）时，那么先实例化一个 Client 对象，然后再调用它的 get 方法会更好一些。因为底层的 TCP 连接会复用，从而带来性能提升。

```python
import httpx

client = httpx.Client()

client.get("https://www.example.com")
```

使用 Client 对象除了能带来性能上的提升，还有一个重要的地方就是，它可以将请求参数保存起来，并让它们跨请求传递。举个例子：

```python
import httpx

response = httpx.get("http://www.baidu.com",
                     headers={"ping": "pong"})
print("ping" in response.request.headers)
"""
True
"""
# httpx 内部每次都会创建一个新的 Client 对象
# 因此在上一个请求当中设置的请求头，与后续请求无关
response = httpx.get("http://www.baidu.com")
print("ping" in response.request.headers)
"""
False
"""

# 先实例化一个 Client 对象，在里面设置请求头
# 那么每一次请求的时候，都会带上，因为用的是同一个对象
client = httpx.Client(headers={"ping": "pong"})
response = client.get("http://www.baidu.com")
print("ping" in response.request.headers)
"""
True
"""
response = client.get("http://www.baidu.com")
print("ping" in response.request.headers)
"""
True
"""

# 在不使用Clent对象应该进行关闭
client.close()

# 使用 with 语句可以自动关闭
with httpx.Client() as client:
    response = client.get("https://www.example.com")

```

除了请求头，像 cookie、超时时间、auth、代理等等都是支持的，一旦设置了，那么后续的每次请求都会带上。



### 九、指定代理

httpx可以通过设置`proxies`参数来使用http代理，我们也可以使用不同的代理来分别处理http和https协议的请求，假设有如下两个代理

```python
import httpx

proxies = {
    'http://': 'http://localhost:8080',  # 代理1
    'https://': 'http://localhost:8081',  # 代理2
}
url = 'https://example.com'
with httpx.Client(proxies=proxies) as client:
    r1 = client.get(url)
    print(r1)
```

上面的代理只是示范，实际场景下请替换成有效的ip代理

还有一点需要注意的是，httpx的代理参数`proxies`只能在`httpx.Client()`中添加，`client.get()`是没有这个参数的。



### 十、SSL证书

HTTP 在传输数据的时候是不安全的，所以引入了 HTTPS。在发送 HTTPS 请求时，httpx 会对服务端主机的 SSL 证书进行验证（默认行为），如果验证失败，或者不信任服务端的 SSL 证书，那么 httpx 会抛出异常。

对于大部分网站来说，它们的 SSL 证书都是由受信任的 CA 机构颁发，所以能够直接正常访问，验证通过。

但有些网站比较特殊，它会单独提供证书，你需要先把证书下载下来，然后发请求的时候带过去。

```python
import httpx

response = httpx.get("https://xxx.org",
                     verify="证书.pem")

with httpx.Client(verify="证书.pem") as client:
    client.get("https://xxx.org")
```

或者你还可以使用标准库 ssl，传递一个 SSLContext 对象。

```python
import ssl
import httpx

ctx = ssl.create_default_context()
ctx.load_verify_locations("证书.pem")
# 或者直接 ctx = httpx.create_ssl_context("证书.pem")
response = httpx.get("https://xxx.org",
                     verify=ctx)
```

SSL 证书是为了保证客户端和服务端之间的数据传输安全，如果你不需要考虑安全性的话，那么也可以指定 verify 为 False，表示禁用 SSL 验证。

既然服务端有证书，那么客户端也可以有。

```python
import httpx

cert1 = "客户端证书.pem"
cert2 = ("客户端证书.pem", "秘钥文件.key")
cert3 = ("客户端证书.pem", "秘钥文件.key", "密码")
httpx.get(
    "https://example.org",
    cert=cert1  # cert2、cert3
)
```

不是太常用，了解一下就好。



### 十一、钩子函数

httpx 还允许我们向 Client 实例注册一些钩子函数，当指定事件发生时会调用，而事件有两种：

- request：请求完全准备好之后，发给服务端之前调用；

- response：从服务端获取响应之后，返回之前调用；

  

通过钩子函数，我们可以跟踪请求的整个过程，并进行记录。

```python
import httpx

def before_request1(request):
    print(f"1）向 {request.url} 发送了请求")

def before_request2(request):
    print(f"2）向 {request.url} 发送了请求")

def after_response1(response):
    print(f"1）服务端返回了响应，状态码 {response.status_code}")

def after_response2(response):
    print(f"2）服务端返回了响应，状态码 {response.status_code}")

client = httpx.Client(
    event_hooks={"request": [before_request1, before_request2],
                 "response": [after_response1, after_response2]}
)
client.get("http://www.baidu.com")
"""
1）向 http://www.baidu.com 发送了请求
2）向 http://www.baidu.com 发送了请求
1）服务端返回了响应，状态码 200
2）服务端返回了响应，状态码 200
"""
```

总的来说，钩子函数很有用，但对于我们简单地发送 HTTP 请求而言，用的不多。

### 十二、异步请求

```python
import asyncio
import httpx

async def send():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://www.example.com")
        ...
async def sendStream():
    client = httpx.AsyncClient()
        # 分块读取
    async with client.stream('GET', 'http://www.baidu.com') as response:
        # 如果是 Client，那么方法名为 iter_bytes
        # 而 AsyncClient 的方法名则是 aiter_bytes
        # 然后遍历要用 async for，因为返回的是异步生成器
        async for chunk in response.aiter_bytes():
            pass
        
    # 关闭的时候要使用 aclose()，而不是 close
    await client.aclose()
        
asyncio.run(send())
```

