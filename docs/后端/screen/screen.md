### 一、背景

系统管理员经常需要SSH 或者telent 远程登录到Linux 服务器，经常运行一些需要很长时间才能完成的任务，比如系统备份、ftp 传输等等。通常情况下我们都是为每一个这样的任务开一个远程终端窗口，因为它们执行的时间太长了。必须等待它们执行完毕，在此期间不能关掉窗口或者断开连接，否则这个任务就会被杀掉，一切半途而废了。

### 二、简介

GNU Screen是一款由GNU计划开发的用于命令行终端切换的自由软件。用户可以通过该软件同时连接多个本地或远程的命令行会话，并在其间自由切换。

GNU Screen可以看作是窗口管理器的命令行界面版本。它提供了统一的管理多个会话的界面和相应的功能。

- 会话恢复

  只要Screen本身没有终止，在其内部运行的会话都可以恢复。这一点对于远程登录的用户特别有用——即使网络连接中断，用户也不会失去对已经打开的命令行会话的控制。只要再次登录到主机上执行 screen -r 就可以恢复会话的运行。同样在暂时离开的时候，也可以执行分离命令 detach ，在保证里面的程序正常运行的情况下让Screen挂起（切换到后台）。这一点和图形界面下的VNC很相似。

- 多窗口

  在Screen环境下，所有的会话都独立的运行，并拥有各自的编号、输入、输出和窗口缓存。用户可以通过快捷键在不同的窗口下切换，并可以自由的重定向各个窗口的输入和输出。Screen实现了基本的文本操作，如复制粘贴等；还提供了类似滚动条的功能，可以查看窗口状况的历史记录。窗口还可以被分区和命名，还可以监视后台窗口的活动。

- 会话共享

  screen可以让一个或多个用户从不同终端多次登录一个会话，并共享会话的所有特性（比如可以看到完全相同的输出）。它同时提供了窗口访问权限的机制，可以对窗口进行密码保护。

GNU's Screen 官方站点：[官方网站](http://www.gnu.org/software/screen/)

### 三、安装

```shell
# CentOS
yum install screen
# Debian/Ubuntu
apt install screen
```

### 四、基本命令

- 帮助查询

  ```shell
  # 查询screen提示
  screen -help # 通过这个命令，可以查询到大部常用命令
  ```

- 查看会话列表

  ```shell
  # 查看已经存在的 screen 会话
  screen -ls
  ```

   ![查看screen终端.png](screen_imgs/查看screen终端.png)

- 新建 screen 会话

  ```shell
  screen  # 创建一个会话, 系统自动命名(形如:XXXX.pts-53.ubuntu)
  
  screen -S name # 创建名为name的会话
  
  screen -R name # 先试图恢复离线的会话。若找不到离线的会话，即建立新的screen会话。
  # 也就是 使用 -R 创建，如果之前有创建唯一一个同名的screen，则直接进入之前创建的screen
  # 而使用 -S 创建和直接输入 screen 创建，不会检录之前创建的screen（也就是会创建同名的screen)
  ```

- 退出当前 screen 会话， 并保存到后台运行

  在当前screen会话中，键盘按下 `Ctrl + a` 再按 `d` 即可保持这个screen到后台并回到主终端;

- 进入（恢复） 某一个 screen 会话

  ```shell
  screen -r <pid/name> # pid/name：为虚拟终端PID或Name
  ```

   ![](screen_imgs/screen恢复演示.png)

  其中 `844375` 为PID， `test` 为 Name

  那么回到 名为test 的screen 会话的命令为：

  ```shell
  screen -r 844375
  # 或 （在没有重名的screen会话情况下）
  screen -r test
  ```

- 窗口操作

  ```shell
  Ctrl+a+w # 展示当前会话中的所有窗口;
  Ctrl+a+c # 创建新窗口;
  Ctrl+a+n # 切换至下一个窗口;
  Ctrl+a+p # 切换至上一个窗口;
  Ctrl+a+num # 切换至编号为num的窗口;
  Ctrl+a+k # 杀死当前窗口，同时也将杀死这个窗口中正在运行的进程，如果一个Screen会话中最后一个窗口被关闭了，那么整个Screen会话也就退出了，screen进程会被终止。
  ```

- 删除某个会话

  可以先进入某个会话当中，使用 `exit`

  也可以在会话外使用命令：

  ```shell
  # 使用-R/-r/-S均可
  screen -R <pid/Name> -X quit
  ```





