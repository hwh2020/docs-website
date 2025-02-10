### 一、安装

基于Docker 安装 RabbitMq

```shell
# 拉取docker镜像
docker pull rabbitmq:management
mkdir -p /usr/local/docker/rabbitmq

docker run -id --name=rabbitmq --hostname mq -v /usr/local/docker/rabbitmq:/var/lib/rabbitmq -p 15672:15672 -p 5672:5672 -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=admin rabbitmq:management

```

- `-id`：以交互模式启动容器并在后台运行。
- `--hostname` : 主机名
- `--name=rabbitmq`：为容器指定一个名称。
- `-v  /usr/local/docker/rabbitmq:/var/lib/rabbitmq`：将主机目录挂载到容器内的 /var/lib/rabbitmq，用于持久化数据。
- `-p 15672:15672`：映射 RabbitMQ 管理页面端口。
- `-p 5672:5672`：映射 RabbitMQ 消息接收端口。
- `-e RABBITMQ_DEFAULT_USER=admin`：设置默认用户名。
- `-e RABBITMQ_DEFAULT_PASS=admin`：设置默认密码。

浏览器访问

http://localhost:15672



### 二、基础篇

#### 基本概念

- publisher 消息发送者
- consumer 消息的消费者
- queue 队列，存储消息
- exchange 交换机，负责路由消息
- virtual-host 虚拟主机，起到数据隔离作用

数据隔离： 先创建用户， 然后在该用户下新建虚拟主机，这样每一种项目都可以互相隔离数据。

#### 配置RabbitMq服务端信息

python 使用 pika 三方库来连接 RabbitMq

异步使用 `aio-pika`



java 使用 Spring AMQP 来连接 RabbitMq



python：



生产者

无回调函数

```python
import asyncio
import aio_pika


async def main():
    connection = await aio_pika.connect_robust(
        "amqp://guest:guest@127.0.0.1/"
    )
    # 建立连接

    queue_name = "test_queue"
    async with connection:
        # 上下文管理，退出时自动关闭connection
        channel = await connection.channel()
        # 创建channel
        # Declaring queue
        queue = await channel.declare_queue(queue_name, auto_delete=True)
        # auto_delete 通道关闭时是否删除队列
        # 声明队列
        async with queue.iterator() as queue_iter:
            async for message in queue_iter:
                async with message.process():
                    print(message.body)
                    # 获取消息

if __name__ == "__main__":
    asyncio.run(main())


```

有回调函数

```python
import asyncio
import aio_pika


async def main():
    connection = await aio_pika.connect_robust(
        "amqp://guest:guest@127.0.0.1/"
    )
    # 建立连接

    queue_name = "test_queue"
    async with connection:
        # 上下文管理，退出时自动关闭connection
        channel = await connection.channel()
        # 创建channel
        # Declaring queue
        queue = await channel.declare_queue(queue_name, auto_delete=True)
        # auto_delete 通道关闭时是否删除队列
        # 声明队列
        async with queue.iterator() as queue_iter:
            async for message in queue_iter:
                async with message.process():
                    print(message.body)
                    # 获取消息

if __name__ == "__main__":
    asyncio.run(main())


```



消费者：

1. 创建连接
2. 生成channel
3. 声明队列,避免队列不存在
4. 通过队列向channel发送消息

```python
import asyncio
import aio_pika

async def main():
    connection = await aio_pika.connect_robust(
        "amqp://guest:guest@127.0.0.1/"
    )
    # 生成连接

    async with connection:
        routing_key = "test_queue"
        channel = await connection.channel()
        # 生成通道

        queue = await channel.declare_queue(routing_key, auto_delete=True)
        # 声明队列信息，避免队列不存在

        await channel.default_exchange.publish(
            aio_pika.Message(body="Hello {}".format(routing_key).encode()),
            routing_key=routing_key,
        )
        # 向指定队列发布消息

if __name__ == "__main__":
    asyncio.run(main())


```



CONNECTING = 'Connecting to the RabbitMQ...'
CONNECTED = 'Successfully connected to the RabbitMQ!'
NOT_CONNECTED = 'The message could not be sent because the connection with RabbitMQ is not established'



producer

```python
import pika

# 1. 创建一个到RabbitMQ server的连接，如果连接的不是本机，
# 则在pika.ConnectionParameters中传入具体的ip和port即可
connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost'))
# 2. 创建一个channel
channel = connection.channel()
# 3. 创建队列，queue_declare可以使用任意次数，
# 如果指定的queue不存在，则会创建一个queue，如果已经存在，
# 则不会做其他动作，官方推荐，每次使用时都可以加上这句
channel.queue_declare(queue='queue1')
# 4. 发布消息
channel.basic_publish(
    exchange='',  # RabbitMQ中所有的消息都要先通过交换机，空字符串表示使用默认的交换机
    routing_key='queue1',  # 指定消息要发送到哪个queue
    body='Hello world!')  # 消息的内容
# 5. 关闭连接
connection.close()

```

consumer

```python
import pika


def main():
    # 1. 创建一个到RabbitMQ server的连接，如果连接的不是本机，
    # 则在pika.ConnectionParameters中传入具体的ip和port即可
    connection = pika.BlockingConnection(
        pika.ConnectionParameters('localhost'))
    # 2. 创建一个channel
    channel = connection.channel()
    # 3. 创建队列，queue_declare可以使用任意次数，
    # 如果指定的queue不存在，则会创建一个queue，如果已经存在，
    # 则不会做其他动作，官方推荐，每次使用时都可以加上这句
    channel.queue_declare(queue='queue1')

    # 4. 定义消息处理程序
    def callback(ch, method, properties, body):
        print('[x] Received %r' % body)

    # 5. 接收来自指定queue的消息
    channel.basic_consume(
        queue='hello',  # 接收指定queue的消息
        on_message_callback=callback,  # 接收到消息后的处理程序
        auto_ack=True)  # 指定为True，表示消息接收到后自动给消息发送方回复确认，已收到消息
    print('[*] Waiting for message.')
    # 6. 开始循环等待，一直处于等待接收消息的状态
    channel.start_consuming()
```



三、高级篇