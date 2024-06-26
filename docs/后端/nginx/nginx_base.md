

### 前提知识

#### 正向代理与反向代理

正向代理是代替客户端去发送请求,反向代理是代替服务端接受请求.

本质上,代理服务器替客户端干活就是正向代理,替服务端干活就是反向代理.

正向代理:

![](./nginx_img/正向代理.png)

反向代理:

![](./nginx_img/反向代理.png)

### 启动Nginx

进入`/usr/local/nginx/sbin`

```shell
./nginx  #启动
./nginx -s stop #快速停止
./nginx -s quit #优雅关闭,在推出前完成已经接受的连接请求
./nginx -s reload #重新加载配置
```

#### 关于防火墙

##### 查看防火墙状态

`systemctl status firewalld`

##### 关闭防火墙 (一般不关闭,而是开放需要的端口)

`systemctl stop firewalld.service`

开放端口,例子;firewall-cmd --zone=public --add-port=80/tcp  -- permanent

`firewall-cmd --zone=public --add-port=端口号/协议 --permanent`

补充: --zone参数是防火墙规则应该的区域

```
public:用于公共网络,例如Internet
internal:用于内部网络,例如公司内部网络
external:用于外部网络,例如连接到互联网的网络
work:用于工作场所的网络.
home:用于家庭网络.
```

##### 禁止防火墙开机启动

`systemctl disable firewalld.service`

##### 重启防火墙

`firewall-cmd --reload`

#### 安装成系统服务

创建服务脚本

`vi /usr/lib/systemd/system/nginx.service`

服务脚本内容

```shell
[Unit] 
Description=nginx # 服务描述
After=network.target remote-fs.target nss-lookup.target 
#指定你的服务应该在哪些系统目标（target）之后启动
# network.target：网络服务的就绪状态
# remote-fs.target ：远程文件系统的就绪状态（等待远程文件系统挂载完成）
# nss-lookup.target ： Name Service Switch (NSS) 查询的就绪状态（等待 DNS 解析和其他命名服务的就绪状态，如果服务需要进行名称解析需要设置这个）

[Service]
Type=forking # Nginx是一个master进程，fork出多个worker进程，所以类型是forking
# simple（服务在启动后会立即进入运行状态，而且不会在后台分叉（fork）出其他子进程。当服务的主进程退出时，系统认为服务已经停止）
# forking（适用于那些启动后立即生成子进程并退出主进程的服务）
# oneshot 适用于只需在启动时执行一次操作的服，服务在启动时执行完成后就停止。这种类型的服务通常用于执行某种初始化任务或者数据加载
# notify 适用于通过向 systemd 发送通知来指示服务已经启动完毕的服务
# dbus 在服务启动完成后，它需要发送一个特定的通知给 systemd，以告知服务已经准备就绪

PIDFile=/usr/local/nginx/logs/nginx.pid
ExecStartPre=/usr/local/nginx/sbin/nginx -t -c /usr/local/nginx/conf/nginx.conf
ExecStart=/usr/local/nginx/sbin/nginx -c /usr/local/nginx/conf/nginx.conf # 服务启动时要执行的命令或脚本
ExecReload=/usr/local/nginx/sbin/nginx -s reload # 重新加载
ExecStop=/usr/local/nginx/sbin/nginx -s stop # 停止
ExecQuit=/usr/local/nginx/sbin/nginx -s quit  # 退出
PrivateTmp=true 
   
[Install]   
WantedBy=multi-user.target  # 多用户
```

重新加载系统服务

`systemctl daemon-reload`

启动服务

`systemctl start nginx.service`

#### 开机启动

`systemctl enable nginx.service`



### Nginx常用命令

```shell
./nginx -s stop # 快速停止（正在进行的请求会直接被中断，很少使用）
./nginx -s quit # 处理完已接受的请求后，才会停止（优雅关机）
./nginx -s reload # 重新加载配置

./nginx -c xxx.conf # 配置nginx使用的配置文件地址（默认为conf/nginx.conf ）

./nginx -t # 检查nginx配置是否正确
./nginx -v # nginx版本号
./nginx -V # nginx详细信息，nginx版本号+编译使用的gcc版本号+编译配置
# 这里可以看到默认的 

# pid文件地址: --pid-path=/var/run/nginx/nginx.pid
# 错误日志地址：--eror-log-path=/var/log/nginx/error.log
# 请求日志地址：--http-log-path=/var/log/nginx/access.log（每一个请求就记录一个日志）

ps -ef|grep nginx #查看nginx进程状态

systemctl status nginx #查看nginx运行状况
```



### 目录结构

```
/usr/local/nginx
├── client_body_temp                 # POST 大文件暂存目录
├── conf                             # Nginx所有配置文件的目录
│   ├── fastcgi.conf                 # fastcgi相关参数的配置文件
│   ├── fastcgi.conf.default         # fastcgi.conf的原始备份文件
│   ├── fastcgi_params               # fastcgi的参数文件
│   ├── fastcgi_params.default       
│   ├── koi-utf
│   ├── koi-win
│   ├── mime.types                   # 媒体类型
│   ├── mime.types.default
│   ├── nginx.conf                   #这是Nginx默认的主配置文件，日常使用和修改的文件
│   ├── nginx.conf.default
│   ├── scgi_params                  # scgi相关参数文件
│   ├── scgi_params.default  
│   ├── uwsgi_params                 # uwsgi相关参数文件
│   ├── uwsgi_params.default
│   └── win-utf
├── fastcgi_temp                     # fastcgi临时数据目录
├── html                             # Nginx默认站点目录
│   ├── 50x.html                     # 错误页面优雅替代显示文件，例如出现502错误时会调用此页面
│   └── index.html                   # 默认的首页文件
├── logs                             # Nginx日志目录
│   ├── access.log                   # 访问日志文件
│   ├── error.log                    # 错误日志文件
│   └── nginx.pid                    # pid文件，Nginx进程启动后，会把所有进程的ID号写到此文件
├── proxy_temp                       # 临时目录
├── sbin                             # Nginx 可执行文件目录
│   └── nginx                        # Nginx 二进制可执行程序
├── scgi_temp                        # 临时目录
└── uwsgi_temp                       # 临时目录
```





### 工作原理

#### Nginx的模块

​	nginx由内核和模块组成,内核的工作是通过查找配置文件将客户端请求映射到一个location block (location是Nginx配置的一个指令,用于URL匹配),在这个location中所配置的每个指令将会启动不同的模块去完成相应的工作.

​	nginx模块<u>从结构上</u>分为三种:

​		**核心模块**:HTTP模块、EVENT模块和MAIL模块

​		**基础模块**:HTTP Access模块、HTTP FastCGI模块、HTTP Proxy模块和HTTP Rewrite模块

​		**第三方模块**:HTTP Upstream Request Hash模块、Notice模块和HTTP Access Key模块

​	

​	nginx模块<u>从功能上</u>分为三种：

​		**Handlers（处理器模块**）:此类模块直接处理请求，并进行输出内容和修改headers信息等操作。Handlers处理器模块一般只能有一个。

​		**Filters （过滤器模块）**:此类模块主要对其他处理器模块输出的内容进行修改操作，最后由Nginx输出。

​		**Proxies （代理类模块）**:此类模块是Nginx的HTTP Upstream之类的模块，这些模块主要与后端一些服务比如FastCGI等进行交互，实现服务代理和负载均衡等功能。

​						

​	Nginx本身做的工作实际很少，当它接到一个HTTP请求时，它仅仅是通过查找配置文件将此次请求映射到一个location block，而此location中所配置的各个指令则会启动不同的模块去完成工作，因此模块可以看做Nginx真正的劳动工作者。通常一个location中的指令会涉及一个handler模块和多个filter模块（当然，多个location可以复用同一个模块）。handler模块负责处理请求，完成响应内容的生成，而filter模块对响应内容进行处理。Nginx的模块直接被编译进Nginx，因此属于静态编译方式。启动Nginx后，Nginx的模块被自动加载



#### Nginx的进程

##### master进程：管理进程

master进程主要用来管理worker进程，具体包括如下四个主要功能：

1. 接受来自外界的信号。
2. 向各个worker进程发送信号。
3. 监控worker进程的运行状态。
4. 当worker进程退出后（异常情况下），会自动重启新的worker进程。

其中，master进程充当整个进程组与用户交互的交互接口，同时对进程进行监护。它不需要处理网络事件，不负责业务的执行，只会通过管理worker进程来实现重启服务、平滑升级、更换日志文件、配置文件实时生效等功能。

##### worker进程：处理请求

多个worker进程之间是对等的，他们同等竞争来自客户端的请求，各进程互相之间是独立的。一个请求，只可能在一个worker进程中处理，一个worker进程，不可能处理其它进程的请求。worker进程的个数是可以设置的，一般我们会设置与机器cpu核数一致。

worker进程是处理基本网络事件。



每个worker进程之间彼此独立,每一个worker进程处理多个请求.



worker进程的抢占机制,多个worker进程争抢一个锁,获取锁的进程进行响应.



worker事件处理机制

传统HTTP服务器是同步处理，当多个客户端请求时，如果Client1的请求被阻塞，Master会fork新的worker进程处理

但是Nginx采用的是异步非阻塞方式，如果Client1的请求被阻塞，worker会取处理下一个请求，不会阻塞当前worker进程。所以Nginx的一个worker进程可以并发处理大量请求

![](./nginx_img/worker事件处理机制.png)

### Nginx基础配置

nginx配置文件是`usr/local/nginx/conf/nginx.conf`

#### 最小配置文件

对nginx.conf文件里面的注释删掉，得到最小配置文件：

```nginx
worker_processes  1; #允许进程数量，建议设置为cpu核心数或者auto自动检测，注意Windows服务器上虽然可以启动多个processes，但是实际只会用其中一个

events {
    use epoll; #使用epoll事件处理机制(默认值)
    #单个进程最大连接数（最大连接数=连接数*进程数）
    #根据硬件调整，和前面工作进程配合起来用，尽量大，但是别把cpu跑到100%就行。
    worker_connections  1024;
}


http {
    #文件扩展名与文件类型映射表(是conf目录下的一个文件)
    include       mime.types;
    #默认文件类型，如果mime.types预先定义的类型没匹配上，默认使用二进制流的方式传输
    default_type  application/octet-stream;

    #sendfile指令指定nginx是否调用sendfile 函数（zero copy 方式）来输出文件，对于普通应用，必须设为on。如果用来进行下载等应用磁盘IO重负载应用，可设置为off，以平衡磁盘与网络IO处理速度。
    sendfile        on; #开启零拷贝
    
     #长连接超时时间，单位是秒
    keepalive_timeout  65;

 #虚拟主机vhost的配置
    server {
    #监听端口
        listen       80;
        #域名，可以有多个，用空格隔开
        server_name  localhost; #域名,主机名

	#配置根目录以及默认页面
        location / {
            root   html; #相对路径,即/usr/local/nginx/html文件
            index  index.html index.htm;
        }

	#出错页面配置
        error_page   500 502 503 504  /50x.html;
        #/50x.html文件所在位置
        location = /50x.html {
            root   html;
        }
        
    }

}
```



##### **worker_processes**

`worker_processes 1;`默认为1，表示开启一个业务进程。



##### **worker_connections**

`worker_connections 1024;`单个业务进程可接受连接数。



##### **include	mime.types;**

`include	mime.types;` 引入http mime类型



##### **default_type  application/octet-stream;**

`default_type  application/octet-stream;`如果mime类型没匹配上,默认使用二进制流方式传输.



##### **sendfile        on;**

`sendfile        on;`未开启sendfile;使用linux的sendfile(socket,file,len)高效网络传输,也就是数据0拷贝

开启sendfile,则用户请求数据不用再加载到nginx内存中,而是直接发送.

高负载的场景下,使用sendfile功能可以降低CPU和内存的占用,提升服务器性能.

```shell
http{
	sendfile:on #off
}
#或者指定某个server开启
server {
	location /{
		sendfile off;
		...
	}
}
```



##### root 与 alias

nginx指定文件路径有两种方式:root与alias.

区别在于:

root 是指定目录的上级目录,并且该上级目录要含有location指定名称的同名目录.

alias 的指定目录是准确的,给location指定一个目录.

```nginx
root：
语法:root path;
配置块: http、server、location、if

alias：
语法：alias path;
配置块: location
```

```nginx
loaction /img/ {
    root /var/www/image/;
} #若按上述配置，则访问/img/目录的文件时，nginx会自动去/var/www/image/img/目录找.

location /img/ {
    alias /var/www/image;
} #若按上述配置，则访问/img/目录的文件时，nginx会自动去/var/www/image/目录找.
```



##### location 里的index

index指令的作用是 在前后端分离的基础上，通过Nginx配置，指定网站初始页。

1. 该指令后面可以跟多个文件，用空格隔开；
2. 如果包括多个文件，Nginx会根据文件枚举顺序来检查，直到查到文件存在
3. 文件可以是相对路径也可以是绝对路径，绝对路径需要放到最后。
4. 文件可以使用`$`来命令。

​	`index	index.$geo.html  index.0.html  /index.html`

该指令有默认值，`index  index.html`即，如果没有给出index指令，默认初始页为index.html

注意：index指令并不是查到文件之后，就直接拿来用了。它的实际工作方式是：

如果文件存在，则使用文件作为路径，发起内部重定向。直观上看上去就像再一次从客户端发起请求，Nginx再一次搜索location一样。

既然是内部重定向，域名+端口不发生变化，所以只会在同一个server下搜索。

同样，如果内部重定向发生在proxy_pass反向代理后，那么重定向只会发生在代理配置中的同一个server。

例子：

```nginx
server {
    listen      80;
    server_name example.org www.example.org;    
    
    location / {
        root    /data/www;
        index   index.html index.php;
    }
    
    location ~ \.php$ {
        root    /data/www/test;
    }
}
```

上面的例子中，如果你使用example.org或www.example.org直接发起请求，那么首先会访问到“/”的location，结合root与index指令，会先判断/data/www/index.html是否存在，如果不，则接着查看/data/www/index.php ，如果存在，则使用/index.php发起内部重定向，就像从客户端再一次发起请求一样，Nginx会再一次搜索location，毫无疑问匹配到第二个~ \.php$，从而访问到/data/www/test/index.php。

#### location指令配置

location语法：` location [ = | ~ | ~* | ^~ ] uri { ... } `

精确匹配：location = /uri

前缀匹配：location ^~/uri  #在正则匹配前

正则匹配：location ~pattern  #区分大小写

正则匹配：location ~*pattern  #不区分大小写

通用匹配：location /  #未匹配到其他location的请求会匹配到这。



location匹配顺序

多个正则location直接按书写顺序匹配，成功后就不会继续往后面匹配
普通（非正则）location会一直往下，直到找到匹配度最高的（最大前缀匹配）
当普通location与正则location同时存在，如果正则匹配成功,则不会再执行普通匹配
所有类型location存在时，“=”匹配 > “^~”匹配 > 正则匹配 > 普通（最大前缀匹配）


### 虚拟主机与域名解析

#### 虚拟主机

Nginx 下，一个 server 标签就是一个虚拟主机。nginx 的虚拟主机就是通过 nginx.conf 中 server 节点指定的，想要设置多个虚拟主机，配置多个server节点即可。

如果一个公司有多个二级域名，没有必要为每个二级域名都提供一台 Nginx 服务器，就可以使用虚拟主机技术，在一台 Nginx 服务器上，模拟多个虚拟服务器。

#### 配置虚拟主机

##### 基于端口的虚拟主机

使用端口来区分,浏览器使用同一个域名+端口或同一个ip地址+端口访问

```nginx
server{
    listen	80;
    server_name nginxtest.com; #指定虚拟主机域名,可以一个或多个.
    
    location / {#location是用来不同的URL请求,对请求做出不同的处理与响应
        root	/home/hello;
        index	index.html index.htm;
    }
}
server{
    listen	81;
    server_name nginxtest.com;
    
    location / {
        root	/home/world;
        index	index.html index.htm;
    }
}
```

浏览器访问http://nginxtest.com/ 会匹配到80端口，因为不带端口默认就是80端口。然后在/home/hello/目录下查找并返回index.html文件，找不到就查找index.htm文件。

浏览器访问http://nginxtest.com:81/会匹配到81端口，显示/home/world/index.html文件内容。

##### 基于域名的虚拟主机

```nginx
server{
    listen	80;
    server_name nginxtest.com;
    
    location / {
        root	/home/hello;
        index	index.html index.htm;
    }
}
server{
    listen	80;
    server_name nginxstudy.com;
    
    location / {
        root	/home/world;
        index	index.html index.htm;
    }
}
```

浏览器访问http://nginxtest.com/，显示/home/hello/index.html中的内容。
浏览器访问http://nginxstudy.com/，显示/home/world/index.html中的内容。

##### server_name的多种匹配规则

完整匹配：

可以在server_name匹配多个域名

`server_name	nginxtest.com	nginxstudy.com;`

通配符匹配：

`server_name	*.test.com;`

`server_name	www.nginx.*;`

正则匹配：

`server_name	~^[0-9]+\.nginx\.com;`



### 反向代理

反向代理——请求到某个域名，该请求被nginx接受到，根据nginx配置把特定的请求转发到对应的服务器。

反向代理这种代理方式是隧道代理，所有请求和响应流量都是经过nginx代理服务器，故而有性能瓶颈。

#### 相关概念

##### 隧道式代理

隧道代理是一种将网络数据包封装在其他网络协议中进行传输的代理技术，其目的是在公共网络上实现安全和私密的数据传输。隧道代理工作方式类似于虚拟专用网络（VPN），可以在公共网络上创建一个虚拟通道，通过该通道进行数据传输，保护数据安全和隐私。隧道代理可以通过加密和身份验证技术，提供更高的安全保障。

一般来说，隧道代理会先在本地建立一个加密隧道，然后将用户请求的数据通过隧道传输到代理服务器，再由代理服务器将数据发送到目标服务器。目标服务器响应数据也会通过代理服务器传输回来，最后再通过隧道传输到本地。

存在问题：即使应用服务器的带宽很大，但是如果代理服务器的带宽很小，那么请求都会阻塞到代理服务器。对于nginx来说，当后端的服务器规模庞大时，nginx的网络带宽就会成为巨大的瓶颈。

##### DR模型 

DR模型（Direct Routing 直接路由）与隧道代理类似，它仅处理一半的连接，即用户发送请求到代理服务器，代理服务器正常将请求发送给应用服务器，在应用服务器处理完请求后直接将响应结果发送给用户，不经过代理服务器。这就避免了nginx的性能瓶颈。

DR模型是LVS提供的功能，LVS负载均衡器既可以使用DR模型，也可以使用隧道式代理模型。

#### 反向代理配置

```nginx
server {
    listen	80;
    server_name nginxtest.com;
    location / {
        proxy_pass http://www.baidu.com/;
    }
}
```

location里面的proxy_pass注意项：

proxy_pass有两种类型：一种是只包含IP和端口号的，即端口号后面没有uri，例如：`http://localhost:8080`。另一种是端口号有其他路径的，包含了uri。例如：`http://localhost:8080/` 或 `http://localhost:8080/test`



对于第一种不带uri的方式，nginx会保留location中的路径部分。例如

```nginx
server {
    listen  80;
    server_name www.test.com;
    location ^~ /test/ {
        proxy_pass http://localhost:8080;
    }
}

#在访问www.test.com/test/abc 时，会代理到http://localhost:8080/test/abc
```

对于第二种带uri的方式，nginx不会保留location中的路径部分，而是直接进行替换。例如

```nginx
server {
    listen  80;
    server_name www.test.com;
    location ^~ /test/ {
        proxy_pass http://localhost:8080/nginx;
    }
}
#在访问www.test.com/test/abc 时，会代理到http://localhost:8080/nginxabc
```

另外一旦配置了proxy_pass，那么root和index就不会进行匹配。

### 负载均衡

#### 基础概念

负载均衡将大量的请求按照某种算法（如轮询)的方式分配给多个后端服务器上（服务器集群），提高系统的容错性和可用性，同时也可以平衡服务器的负载，提高系统的性能和吞吐量。当访问的服务器定期维护或宕机时，按照算法转换到另一个服务器去获取服务。

#### L4负载均衡

在传输层（第四层）上工作的。它基于 IP 地址和端口号来进行负载均衡，不考虑传输的具体内容，仅通过查看传入数据包的目标 IP 地址和端口号，并根据预定义的规则将其转发到后端服务器上。

四层负载均衡器的主要优点是性能高，因为它只关注传输层的信息，不需要解析应用层协议的数据。常见的四层负载均衡器：

- F5硬负载均衡（硬件，价格昂贵）
- LVS四层负载均衡
- Haproxy四层负载均衡
- Nginx四层负载均衡（Nginx 1.9版本后才支持，用得少Nginx一般用做七层负载均衡）

#### L7负载均衡

在应用层（第七层）上工作的。它不仅考虑了传输层的信息（如 IP 地址和端口号），还分析了传输的应用层数据，例如 HTTP 请求的 URL、Cookie、报头等信息。基于这些信息，七层负载均衡器可以做出更精细的决策，并根据具体的应用需求将流量分发到不同的后端服务器上。

七层负载均衡器在传输层和应用层之间工作，因此它比四层负载均衡器更智能，可以实现更复杂的负载均衡策略。常见的七层负载均衡器：

- Nginx七层负载均衡
- Haproxy七层负载均衡
- apache七层负载均衡（并发到达百万级别，性能会大幅下降）



#### nginx负载均衡

##### 反向代理单个服务器

```nginx
http {
    server {
        listen 80;
        server_name www.test.com;
        location / {
            proxy_pass http://nginx.com:8080;
        }
    }
}

# 在访问www.test.com/abc?a=1时，会代理到http://nginx.com:8080/abc?a=1
```

##### 反向代理集群

如果一个服务是由多个服务器提供，需要把负载分配到不同服务器处理，则需要负载均衡。默认是轮询方式。

```nginx
http {
    upstream names {
        server 192.168.25:8050; #反向服务器地址加端口
        server 192.168.174:80; #如果是80端口，可以省略不写
	}
    server {
        listen 80;
        server_name localhost;
        location / {
            proxy_pass http://names;
        }
    }
}
```



##### 负载均衡策略

###### 轮询

默认情况下使用轮询方式，逐一转发，这种方式适用于无状态请求。

###### weight(权重)

weight默认为1，weight越大，负载分发的概率越大。

```nginx
upstream names {
	server 192.168.25:8050 weight=8; 
	server 192.168.174:80 weight=2; 
}
```

down与backup

```nginx
upstream names {
	server 192.168.25:8050 weight=8 down;#down表示当前这个server暂时不参与负载
    server 127.0.0.1:80;
	server 192.168.174:80 weight=2 backup;
    #backup表示备用机，一般不参与负载，只有当其他非backup服务器都宕机或down时，才会请求backup服务器。
}
```

失败重试

```nginx
upstream test_server{
    # 失败次数超过max_fail后，Nginx在fail_timeout时间内将不会转发任何请求给这个服务，超过fail_timeout后会在尝试一次。成功则恢复转发，否则仍fail_timeout时间，再次尝试
		server 192.168.174.133:80 max_fail=2 fail_timeout=10s;
		server 192.168.174.134:80 ;
}
```



###### ip_hash 

根据客户端的ip地址转发同一台服务器,可以保持回话.

回话: 轮询和权重策略都是对服务器进行切换,但是每次切换到另一台服务器后,本来的session和cookie会失效,得在这一台服务器重新进行请求.

而ip_hash是通过将用户的ip进行hash计算,映射到某一个服务器上,即每一个用户会固定分配到一台机器，防止在A机器上创建Session的用户，后续被分配到其他机器，导致Session失效.

```nginx
upstream test_server{
    # 开启ip_hash，
    ip_hash;
    
		server 192.168.174.133:80;
		server 192.168.174.134:80;
}
```

注意:如果在集群中的某台服务器出现故障，想要从nginx的集群配置中移除掉，不可以直接的将那一行删掉，比如server 192.168.121.167:8080 weight=2 ;删掉，如果直接删掉会导致nginx的hash算法重新计算，那么用户的回话或者说缓存都会失效掉，所以这里如果不用这台服务器，直接比较为down即可.

###### least_conn

尽可能将请求转发到当前连接数最少的后端服务器

```nginx
upstream test_server{
    least_conn;
	server 192.168.174.133:80;
	server 192.168.174.134:80;
}
```

###### url_hash

根据用户访问的url定向流量转发请求

###### fair

根据后端服务器响应时间转发请求



### 动静分离

一种是将静态文件拆分出来，放置在独立域名下的服务器（主流方案）。另一种是混合在一起，使用nginx区分。通过location 指定不同的后缀名实现不同的请求转发。

例如:将静态文件存放到nginx服务器上，目录为/home/static，分别上传1.jpg和2.jpg

```nginx
location /images { 
    # alias /home/static;
    root /home/static;
    index index.html index.htm;
}
```

### URLRewrite 

Rewrite主要实现url地址重写，以及重定向，就是把传入web的请求重定向到其他url的过程.

rewrite和location的功能有点相像，都能实现跳转，主要区别在于rewrite常用于同一域名内更改获取资源的路径，而location是对一类路径做控制访问和反向代理，可以proxy_pass到其他服务器。

`rewrite语法: rewrite regex(正则表达式) replacement [flag]`

rewrite是实现URL重写的关键指令，根据regex（正则表达式）部分的内容，重定向到replacement部分，结尾是flag标记。

```shell
flag标记说明
last #本条规则匹配完成后，继续向下匹配新的location URI规则
break #本条规则匹配完成即终止，不再匹配后面的任何规则
redirect #返回302临时重定向，浏览器地址会显示跳转后的URL地址
permanent #返回301永久重定向，浏览器地址栏会显示跳转后的URL地址
```

应用位置:server、location、if

例子：

```nginx
server {
    listen 80;
    server_name localhost;
    
    location / {
        rewrite ^/[0-9].html$  /index.jsp?pageNum=$1  break;
        proxy_pass http://192.168.44.104:8080;
    }
}
```



### 防盗链

当我们请求到一个页面后，这个页面一般会再去请求其中的静态资源，这时候请求头中，会有一个refer字段，表示当前这个请求的来源，我们可以限制指定来源的请求才返回，否则就不返回，这样可以节省资源

![](./nginx_img/防盗链_01.png)

```nginx
valid_referers none | blocked | server_names | strings …;
```

设置有效的refer值

- none：不校验refer
- blocker: 检测 Referer 头域的值被防火墙或者代理服务器删除或伪装的情况。这种情况该头域的值不以“http://” 或 “https://” 开头。
- server_name：校验refer地址是否为server_name（server_name可以使用通配符）

注意：` if ($invalid_referer)`中if后有个空格，不写就会报错

```shell
nginx: [emerg] unknown directive "if($invalid_referer)" in /usr/local/nginx/conf/nginx.conf:27
```

例子：这里设置nginx服务器中的img目录下的图片必须refer为http:192.168.44.101才能访问

```nginx
server {
        listen       80;
        server_name  localhost;
			
      
				location /img{
                valid_referers 192.168.44.101; #注意,这不是主机的ip,而是来源的网址域名http://192.168.44.101
                if ($invalid_referer){#无效的
                        return 403;#返回状态码403
                }
                root html;
                index  index.html index.htm;
        }

}
```

如果引用这张图片的页面且refer并没有被设置，图片无法加载出来

如果直接访问图片地址，因为没有refer字段指向来源，会直接显示Nginx的页面

![](./nginx_img/防盗链_02.png)

**设置盗链图片**

将提示图片放在html/img/x.png，访问设置防盗链图片时，就返回这x.png张图

```nginx
location /img{
                valid_referers http:192.168.44.101;
                if ($invalid_referer){#无效的
                     rewrite ^/  /img/x.png break;
                }
                root html;
                index  index.html index.htm;
}
```

#### 使用curl测试

浏览器为了加速访问页面,会进行缓存,在进行测试时有可能刷新不到最新的页面.

使用curl命令非常有效解决该问题.另外,curl命令在系统测试和渗透测试时也非常有用.

安装:

`yum install -y curl`

命令:

```shell
curl -I http://192.168.44.101/img/logo.png
#-I :不会把内容显示出来,只返回响应头的信息.
```

带引用

```shell
curl -e "http://baidu.com" -I http://192.168.44.101/img/logo.png
#-e :表示带上referer字段.
```



### Nginx高可用

#### 解决方案

当只有一个nginx作为网关,一旦它出现故障就会导致全部服务不可用.

若使用之前的nginx负载均衡的思路,再添加一个nginx进行负载,即:

![](./nginx_img/nginx高可用_01.jpg)

那么,会陷入逻辑黑洞,因为如果最前面的nginx又宕掉了,该如何呢?所以不能在前面再加一个负载均衡器.

高可用方案:

![](./nginx_img/nginx高可用_02.png)

使用keepalived实现高可用,它实际是一个小小的软件,其作用是两台机器的keepalived互相通讯,检测对方的机器是否挂掉.

用户访问的是虚拟vip地址,这个ip地址在哪台机器是不固定的,一旦备用机的keepalived检测到主服务器挂掉,就会把虚拟vip地址争夺过来,成为主服务器,提供服务.若之前那个服务器恢复上线后,就要通过竞选机制(优先级配置),即优先级越高,成为master的几率越高.

keepalived只是把虚拟vip地址进行切换,并没有把物理ip地址进行切换.

注意：Nginx主备机器配置要基本一致，如果配置相差较大，在切换时大量流量进入备用机，容易造成宕机

#### 高可用配置

##### 安装keepalived

###### 编译安装

下载地址

```c
https://www.keepalived.org/download.html#
```

使用`./configure`编译安装

```shell
# 解压到当前目录
tar -zxvf  xxx 

# 安装编译环境
yum install -y gcc openssl-devel libnl3 libnl3-devel

# 指定编译配置
./configure --prefix=/usr/local/keepalived --sysconf=/etc #--prefix指定安装路径，--sysconf指定keepalived配置文件位置（必须指定为/etc目录，否则报错）

# 编译
make 

# 安装
make install

# 配置文件在目录/etc/keepalived，新建或者把keepalived.conf.sample改成keepalived.conf文件
cd /etc/keepalived
mv keepalived.conf.sample keepalived.conf
```

注册为系统服务

```shell
# 从安装目录找到两个 keepalived 文件，移到etc下对应目录
cp /keepalived-2.2.8/keepalived/etc/init.d/keepalived /etc/init.d

cp /keepalived-2.2.8/keepalived/etc/sysconfig/keepalived  /etc/sysconfig/


systemctl daemon-reload

systemctl start keepalived.service
```



###### yum安装

```shell
yum install -y keepalived
```



配置文件在`/etc/keepalived/keepalived.conf`

##### 默认配置

```shell
! Configuration File for keepalived

global_defs {
	 # keepalived邮件通知（可配置多个）
   notification_email {
     acassen@firewall.loc
     failover@firewall.loc
     sysadmin@firewall.loc
   }
   # 邮件发件人地址
   notification_email_from Alexandre.Cassen@firewall.loc
   # 邮件服务器（SMTP）地址
   smtp_server 192.168.200.1
   # 连接SMTP服务器的超时时间
   smtp_connect_timeout 30
   # 后面会提到
   router_id LVS_DEVEL
   # vrrp相关配置，用的比较少
   vrrp_skip_check_adv_addr
   vrrp_strict
   vrrp_garp_interval 0
   vrrp_gna_interval 0
}

vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    virtual_ipaddress {
        192.168.200.16
        192.168.200.17
        192.168.200.18
    }
}

virtual_server 192.168.200.100 443 {
    delay_loop 6
    lb_algo rr
    lb_kind NAT
    persistence_timeout 50
    protocol TCP

    real_server 192.168.201.100 443 {
        weight 1
        SSL_GET {
            url {
              path /
              digest ff20ad2481f97b1754ef3e12ecd3a9cc
            }
            url {
              path /mrtg/
              digest 9b3a0c85a887a256d6939da88aabd8cd
            }
            connect_timeout 3
            retry 3
            delay_before_retry 3
        }
    }
}

virtual_server 10.10.10.2 1358 {
    delay_loop 6
    lb_algo rr
    lb_kind NAT
    persistence_timeout 50
    protocol TCP

    sorry_server 192.168.200.200 1358

    real_server 192.168.200.2 1358 {
        weight 1
        HTTP_GET {
            url {
              path /testurl/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334d
            }
            url {
              path /testurl2/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334d
            }
            url {
              path /testurl3/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334d
            }
            connect_timeout 3
            retry 3
            delay_before_retry 3
        }
    }

    real_server 192.168.200.3 1358 {
        weight 1
        HTTP_GET {
            url {
              path /testurl/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334c
            }
            url {
              path /testurl2/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334c
            }
            connect_timeout 3
            retry 3
            delay_before_retry 3
        }
    }
}

virtual_server 10.10.10.3 1358 {
    delay_loop 3
    lb_algo rr
    lb_kind NAT
    persistence_timeout 50
    protocol TCP

    real_server 192.168.200.4 1358 {
        weight 1
        HTTP_GET {
            url {
              path /testurl/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334d
            }
            url {
              path /testurl2/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334d
            }
            url {
              path /testurl3/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334d
            }
            connect_timeout 3
            retry 3
            delay_before_retry 3
        }
    }

    real_server 192.168.200.5 1358 {
        weight 1
        HTTP_GET {
            url {
              path /testurl/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334d
            }
            url {
              path /testurl2/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334d
            }
            url {
              path /testurl3/test.jsp
              digest 640205b7b0fc66c1ea91c463fac6334d
            }
            connect_timeout 3
            retry 3
            delay_before_retry 3
        }
    }
}
```



##### 最小配置

###### 双机主备方案

机器一：

```shell
! Configuration File for keepalived

global_defs {
   router_id lb111 # 路由id，可以随意取，但是要保证每个配置了keepalive的机器不重复就行
}

vrrp_instance VI_1 { #vrrp是内网当中通讯的协议，节点名可以随意取，但要保证主、备节点之间保持一致即可
    state MASTER #当前机器是Master，一个集群只能有一个Master，其他写BACKUP
    interface eth0 #eth0是机器网卡的名字，使用ip addr查看
    virtual_router_id 51 #保证主、备节点之间保持一致即可
    priority 100 #主备竞选的优先级
    advert_int 1 #间隔检测时间，主、备节点之间同步检查的时间间隔（单位秒）
    authentication { #与别的keepalived成为一组的认证，主备之间保持一致
        auth_type PASS # 指定了认证类型为密码（PASS）
        auth_pass 1111 # 设置了认证密码，这里设置的密码是"1111"
    }
    virtual_ipaddress { #虚拟的ip地址
        192.168.44.200
    }
}
```

机器二：

```shell
! Configuration File for keepalived

global_defs {
   router_id lb110
}

vrrp_instance VI_1 { 
    state BACKUP 
    interface eth0 
    virtual_router_id 51
    priority 50
    advert_int 1 
    authentication { 
        auth_type PASS
        auth_pass 1111
    }
    virtual_ipaddress { 
        192.168.44.200
    }
}
#注意,vrrp_instance、virtual_router_id、authentication要与主服务器一致，否则不会加入到一组里面。
```

启动

```shell
# 启动
keepalived

# 判断是否成功启动
ps aux | grep keepalived
```

###### 双主热备方案

上面的配置，如果不出现故障的情况下，一直是机器一在工作，机器二白白浪费了

可以使用**双主热备**方案：

![](./nginx_img/双主热备方案.png)

### 参考资料

1. [尚硅谷Nginx教程(亿级流量nginx架构设计)](https://www.bilibili.com/video/BV1yS4y1N76R/)
2. [Nginx学习|何叨叨的个人博客](https://heyingjiee.github.io/docs/otherLanguage/Nginx学习.html)
3. [Nginx反向代理负载均衡虚拟主机动静分离UrlRewrite防盗链](https://blog.csdn.net/qq_44300280/article/details/126557631)
