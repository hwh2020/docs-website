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

`http://localhost:15672`



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



### 三、集成到fastapi

```python
# -*- coding: utf-8 -*-
"""
@Time : 2025/2/8 11:22
@Author : Mr.how
@Des: xxx
"""
import json
import asyncio
import time
from datetime import datetime
import pickle
from dataclasses import dataclass
from aio_pika import connect, connect_robust, Message, IncomingMessage, Channel
from aio_pika.abc import AbstractRobustConnection, AbstractRobustChannel
from aio_pika.pool import Pool

from app.core.logger import logger
from app.settings.config import settings

from app.utils.check_expired_orders import close_order



@dataclass
class RabbitMQClient:
    url: str| None = None
    connection_pool: Pool|None = None
    channel_pool: Pool|None = None


    async def __clear(self) -> None:
        """
            清除资源，关闭链接
        """
        if not self.channel_pool.is_closed:
            await self.channel_pool.close()
        if not self.connection_pool.is_closed:
            await self.connection_pool.close()
        self.channel_pool = None
        self.connection_pool = None
        self.url = None

    async def __get_connection(self) -> AbstractRobustConnection:
        return await connect_robust(self.url)
    async def __get_channel(self) -> Channel:
        async with self.connection_pool.acquire() as connection:
            return await connection.channel(publisher_confirms=False)

    async def connect(self) -> None:
        """
            链接RabbitMQ
        """
        logger.info("正在连接RabbitMQ")
        try:
            RABBIT_URL = f"amqp://{settings.RABBITMQ_USER}:{settings.RABBITMQ_PASSWORD}@{settings.RABBITMQ_HOST}:{settings.RABBITMQ_PORT}/"
            logger.debug(f"正在连接RabbitMQ: {RABBIT_URL}")
            self.url = RABBIT_URL
            self.connection_pool = Pool(self.__get_connection, max_size=2)
            self.channel_pool = Pool(self.__get_channel, max_size=10)
            # self.connection = await connect_robust(RABBIT_URL)
            # self.channel = await self.connection.channel(publisher_confirms=False)
            logger.info("成功连接到RabbitMQ")
        except Exception as e:
            logger.error(f"{e}")
            await self.__clear()

    async def disconnect(self) -> None:
        """
            关闭连接
        """
        await self.__clear()

    async def send_message(self, messages: list | dict, routing_key: str, delayQueueName: str, delay:int = 5) -> None:
        """
            发送消息到队列
        """
        async with self.channel_pool.acquire() as channel:

            if isinstance(messages, dict):
                messages = [messages]

            # 声明死信交换机
            dlx_exchange = await channel.declare_exchange("order_exchange")
            dlx_queue = await channel.declare_queue("cancelOrder", durable=True)
            await dlx_queue.bind(dlx_exchange, routing_key)

            # 声明延迟交换机 与 延迟队列
            delay_exchange = await channel.declare_exchange("delay_exchange",type="direct")
            delay_queue = await channel.declare_queue(delayQueueName,durable=True, arguments={
                "x-dead-letter-exchange": "order_exchange",  # 指定了消息过期后转发到的目标交换机和路由键
                'x-dead-letter-routing-key': routing_key,  # 死信路由键
                "x-message-ttl": delay * 1000  # 设置消息过期时间（毫秒）
            })
            await delay_queue.bind(delay_exchange, routing_key)

            async with channel.transaction(): # 开启事务
                # exchange = await self.channel.declare_exchange(direct,type="direct")  # 先声明交换机
                # queue = await self.channel.declare_queue(routing_key, durable=True)  # 再声明队列
                # passive 是否被动的 如果这个是True,那么如果队列不存在的话，启动消费者 会直接的抛出异常，默认为false的，如果队列不存在的话，也不会报异常
                # durable 消息队列是否是持久化， True开启 false关闭： 关闭的话，如果重启RABBIT，所有的队列消息会丢失
                # exclusive  设置是否排他，队列是否是独占模式 ，独占模式是指当前的队列只限于当前的链接，如果连接断开，其他也无法来使用此队列
                # await queue.bind(exchange, routing_key)  # 将队列绑定到交换机
                for message in messages:
                    message = Message(body=json.dumps(message).encode())
                    await delay_exchange.publish(message, routing_key=routing_key) # 发送消息,交换器会自动路由到绑定的队列中


    async def consume(self, queueName:str = "cancelOrder") -> None:
        """
            消费
        """
        async with self.channel_pool.acquire() as channel:
            await channel.set_qos(prefetch_count=10)
            queue = await channel.get_queue(queueName)
            async with queue.iterator() as queue_iter:
                async for message in queue_iter:
                    try:
                        message_dict = json.loads(message.body)
                        logger.info(f"执行取消订单:{message_dict}, time:{time.time()}")
                        await close_order(message_dict['order_sn'])
                        await message.ack()
                    except Exception as e:
                        logger.error(f"{e}")
                        await message.nack()


rabbit_client = RabbitMQClient()



async def on_message(message: IncomingMessage):
    """
        消息处理回调函数
    """

    async with message.process(reject_on_redelivered=True):
        await asyncio.sleep(5)
    logger.info(f"模拟取消订单：{message.body.decode()}, time:{datetime.now()}")
        # logger.info(f"Received message: {}")


async def cancelOrderOnMessage(message: IncomingMessage):
    async with message.process():
        message = json.loads(message.body)
        logger.debug(f"message:{message}")
        await close_order(message['order_sn'])


async def start_consumer():
    # asyncio.run(rabbit_client.consume(exchangeName,on_message))
    await rabbit_client.consume(queueName="cancelOrder")
    # await asyncio.Future()


```

