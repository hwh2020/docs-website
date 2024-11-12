### 一、协程

协程不是计算机提供的,计算机有(进程,线程).协程是程序员人为创造的.可以理解为微线程.用一个线程在代码中来回切换游走地运行.

```python
# main.py

def func1():
    print(1)
    ...
    print(2)

def func2():
    print(3)
    ...
    print(4)
```

普通的同步函数就算按顺序依次执行函数 func1() 、func2 ()

而如果是协程,那么可以在函数之间来回切换运行.(只有一个线程来完成这个事情)

实现协程的方法

- greenlet 早期模块，第三方模块
- yield 关键字
- asyncio 装饰器 （python 3.4 引入）
- async， await 关键字 （python 3.5 引入）推荐



#### 实现方法

##### greenlet

```shell
pip install greenlet
```

```python
from greenlet import greendef func1():
def func1():
	print(1)		# 第2步
	gr2.switch()	# 第3步，切换到func2函数
	print(2)		# 第6步
	gr2.switch()	# 第7步，切换到func2函数，从上一次执行的位置继续向后执行
    
def func2():
	print(3)		# 第4步
	gr1.switch()	# 第5步，切换到func1函数，从上一次执行的位置继续向后执行
	print(4)		# 第8步
    
gr1 = greenlet(func1)
gr2 = greenlet(func2)
gr1.switch()		# 第1步，执行funcl函数
    
```

##### yield 关键字

```python
def func1():
	yield 1
	yield from func2()
	yield 2
    
def func2():
	yield 3
	yield 4
    
f1= func1()
for item in f1:
	print(item)
# 依次输出1 3 4 2
```

yield的机制是暂停运行过程输出当前结果并保留状态，状态包括上次终止的位置和终止时的数值。下一次next()时从上一次终止的地方开始, 了解即可

##### asyncio 装饰器

```python
import asyncio

@asyncio.coroutine
def funcl():
	print(1)
	yield from asyncio.s1eep(2) # 遇到IO耗时操作，自动化切换到tasks中其他任务
	print(2)
    
@asyncio.coroutine
def func2():
	print(3)
	yield from asyncio.sleep(2) # 遇到Io耗时操作，自动化切换到tasks中其他任务
	print(4)
    
tasks = [
    asyncio.ensure_future( funcl() ),
	asyncio.ensure_future( func2() )
]

loop = asyncio.get_event_loop()
loop.run_until_complete(asyncio.wait(tasks))
loop.close()
```

注意:遇到IO阻塞自动切换.

##### async & await

```python
import asyncio

async def funcl():
	print(1)
	await asyncio.s1eep(2) # 遇到IO耗时操作，自动化切换到tasks中其他任务
	print(2)
    
async def func2():
	print(3)
	await asyncio.sleep(2) # 遇到Io耗时操作，自动化切换到tasks中其他任务
	print(4)
    
#tasks = [
#	asyncio.ensure_future( funcl() ),
#	asyncio.ensure_future( func2() )
#]

#loop = asyncio.get_event_loop()
#loop.run_until_complete(asyncio.wait(tasks))


async def main():
    task1 = asyncio.create_task(func1())
    task2 = asyncio.create_task(func2())
    await task1
    await task2

asyncio.run(main())
```

 

### 二、事件循环

异步程序的核心是事件循环。

可以简单地理解为死循环去检测并执行某些代码

```python
# 伪代码
任务列表 = [任务1， 任务2， 任务3...]
while True:
    可执行的任务列表, 已完成的任务列表 = 去任务列表中检查所有任务，返回"可执行"和"已完成"的任务
    for 就绪任务 in 可执行任务列表:
        执行已就绪的任务
    
    for 已完成的任务 in 已完成的任务列表:
        在任务列表中移除 已完成的任务
        
    如果 任务列表 中的任务都完成则退出循环
```



### 三、asyncio

#### 简单使用

首先需要定义一个异步函数，使用 `async` 关键字定义，异步函数需要使用 `await` 关键字进行调用。如果我们直接调用异步函数，它只会返回一个可等待对象，并不会执行函数。我们需要使用 `asyncio.run` 来执行异步函数，或者在其他异步函数中使用 `await` 关键字进行调用：

```python
import asyncio

async def func():
    ...
# 使用run执行
asyncio.run(func())
# 或者在别的异步函数中调用
async def main():
    await func()  # 异步函数通过 await 来调用，await 只能放在 async 函数内
asyncio.run(main())
```

在asyncio中，事件循环是核心组件，它负责注册、调度和执行所有的协程任务。当我们调用`asyncio.run()`函数时，会创建一个事件循环并运行指定的协程。事件循环会不断地从任务队列中取出待执行的任务，并将它们添加到事件循环中进行调度。

当一个协程中遇到`await`关键字时，事件循环会挂起当前协程并将控制权交给其他可执行的协程。被挂起的协程会暂时离开事件循环，并在异步操作完成后恢复执行。

异步操作完成后，事件循环会将结果传递给对应的Future对象，然后唤醒等待该Future对象的协程，使其继续执行。



前面提到可等待对象，那么什么是可等待对象？

简单来说，可等待对象是可以在`await`表达式中使用的对象。它们可以暂停异步函数的执行，等待某个操作完成后再恢复执行。Python中的可等待对象主要包括三种类型：

1. **协程对象(coroutine objects)**
2. **Task对象**
3. **Future对象**



#### Future

Future 主要是用于低级别的异步编程。通常情况下，没有必要在应用层级的代码中创建 Future 对象。开发者更多使用高层次的抽象如任务对象，但了解Future对象仍然很有价值。

Future 是 Python 的一个类，它的实例我们一般称为未来对象（future），它包含一个你希望在未来某个时间点获得、但目前还不存在的值。通常，当创建 future 时，它没有任何值，因为还不存在。

在这种状态下，它被认为是不完整的、未解决的或者没有完成的。然后一旦你得到一个结果，就可以设置 future 的值，这将完成 future。那时，我们可以认为它已经完成，并可从 future 中提取结果。

Furture对象内部封装了一个`_state`，这个`_state`维护着四种状态：Pending、Running、Done，Cancelled，如果变成Done完成，就不再等待，而是往后执行，这四种状态的存在其实类似与进程的运行态、就绪态、阻塞态，事件循环凭借着四种状态对 Future\协程对象 进行调度。

```python
import asyncio

future = asyncio.Future()
print("future 是否完成:", future.done())
"""
future 是否完成: False
"""
# 调用 set_result 设置结果
future.set_result("mrhow")
print("future 是否完成:", future.done())
"""
future 是否完成: True
"""
print(future)
"""
<Future finished result='mrhow'>
"""
print("future 的返回值:", future.result())
"""
future 的返回值: mrhow
"""
```

future 有一个 done 方法，调用之后会返回布尔值，标记此 future 是否已经运行完成。运行完成返回 True，否则返回 False。

而当调用 future.set_result() 之后，就代表它运行完成了，该方法会给 future 设置一个结果。因为它的含义是未来对象，包含一个从未来某个时刻才存在的值，当它内部还没有这个值的时候，就代表它还处于未完成（pending）状态，一旦有值了，那么就会变成已完成（finished）状态。而当状态变成已完成时，便可以调用 result 方法拿到相应的结果。

注意：我们只能调用一次 set_result，但是 result 可以多次调用。

future 对象除了有 set_result 方法之外，还有一个 set_exception 方法。因为在未来的某个时刻，我们本应该把结果值设置给 future，但由于某些原因执行出错了，我们并没有拿到结果值，那么这时候就应该将异常设置给 future。

首先 set_result 方法是可以接收异常的，因为异常本身也是一个对象，也可以作为一个结果。但为了区分，我们会使用 set_exception，因为如果还使用 set_result 方法的话，那么我们就无法判断这个异常是因为报错产生的，还是某个函数本身就返回了异常。

注：set_exception 方法必须接收一个异常对象。

```python
from asyncio import Future

future = Future()
# 注意：不管是调用 set_result 还是 set_exception
# 都会将 future 的状态标记为已完成（finished）
future.set_exception(ValueError("o_O"))
print(future.done())
"""
True
"""
# 调用 exception() 方法会拿到相应的异常
print(future.exception())
"""
o_O
"""
```

当 future 的状态为已完成时，怎么知道它接收的是正常的结果值，还是异常呢？

调用 future.set_result() 之后：

- 调用 future.result() 会返回设置的结果；
- 调用 future.exception() 会返回 None；

调用 future.set_exception() 之后：

- 调用 future.exception() 会返回设置的异常；
- 调用 future.result() 会将异常抛出来；

所以当不确定 future 内部是否是正常的结果值，那么可以先调用 exception 方法，如果它返回的是 None，那么再调用 result。

future 还可以绑定回调，当它处于已完成状态时，会触发回调的执行。

```python
from asyncio import Future

def callback(future: Future):
    if (exc := future.exception()) is not None:
        print("出现异常:", exc)
    else:
        print("future 的结果值:", future.result())

async def main():
    future1 = Future()
    future2 = Future()
    # 调用回调时，会自动将 future 本身作为参数传递过去
    future1.add_done_callback(callback)
    future2.add_done_callback(callback)
    # 状态为 finished 时，会触发回调的执行
    future1.set_result("Some Value")
    future2.set_exception(RuntimeError("Some Value"))

asyncio.run(main())
"""
future 的结果值: Some Value
出现异常: Some Value
"""
```

future 还有 cancel 方法：

```python
from asyncio import Future

future = Future()
print("是否被取消:", future.cancelled())
"""
是否被取消: False
"""
future.cancel()
print("是否被取消:", future.cancelled())
"""
是否被取消: True
"""
# 一旦被取消，就不再调用 set_result 和 set_exception 了
```

因此`await future` 会阻塞等待，当 future 状态为已完成时，自动调用 future.result() 方法，将结果值返回。



#### Task

在 asyncio 中，如果协程想要并发运行，那么它必须被包装为 Task 对象，也就是任务。

Task 是 Future 的子类，而一个任务可以看做是一个 future 和一个协程的组合。

future 可以被认为代表了我们暂时不会拥有的值，而一个任务可以被认为是一个协程和一个 future 的组合。创建一个任务时，我们正在创建一个空的 future，并运行协程。然后当协程运行得到结果或出现异常时，将其设置给 future。 

await future 需要我们手动调用 future.set_result()，而 await task  那么当协程执行完毕时会自动调用 future.set_result（执行出错则自动调用 future.set_exception）

不管 await 后面跟的是任务还是 future，本质上都是等到 future 里面有值之后，通过 future.result() 拿到里面的值。

```python
import asyncio

async def func():
    return "Some Value"

async def main():
    # 将协程包装成任务，并且还可以起个名字
    # 需要注意的是，当协程被包装成任务的时候，就已经开始运行了
    task = asyncio.create_task(coro(), name="任务 1")
    # 如果你希望拿到返回值，程序才能继续执行，那么使用 await 阻塞等待
    result = await task
    print("返回值:", result)

asyncio.run(main())
```

创建任务除了使用` asyncio.create_task()` , 还可以使用 `loop.create_task()` 、`asyncio.ensure_future()`

```python
import asyncio

async def func():
    return "Some Value"

async def main():
  	# 获取正在运行的事件循环
    loop = asyncio.get_running_loop()
    task = loop.create_task(func())
    # task = asyncio.ensure_future(func())
    result = await task
    print("返回值:", result)

asyncio.run(main())
```

- `asyncio.create_task()`：是一个便捷方法，直接通过当前的默认事件循环创建任务
- `loop.create_task()`：需要明确提供事件循环，适用于更复杂或特定需求的场景，比如管理多个事件循环。
- `asyncio.ensure_future()`：可以将一个协程转换为一个 Future 对象。处理协程对象和 Future 对象，更加通用，适用于更多场景。



##### **取消Task**

在 asyncio 中，当一个 Task 对象的 cancel() 方法被调用时，它会请求取消该任务。具体步骤如下：

- 标记任务为取消状态：调用 cancel() 方法后，任务会被标记为取消状态。
- 抛出 CancelledError 异常：再次调度这个任务时，它会在等待的位置抛出一个 asyncio.CancelledError 异常。
- 任务处理异常：协程内部可以捕获这个异常，进行相应的清理操作。

```python
import asyncio


async def cancellable_task():
    try:
        print("Task 启动")
        await asyncio.sleep(10)  # 长时间任务
        print("Task 完成")
    except asyncio.CancelledError:
        print("Task 被取消")
        raise  # 重新抛出err，以便外部可以检测到任务已被取消


async def main():
    task = asyncio.create_task(cancellable_task())
    await asyncio.sleep(2)  # 等待一段时间
    task.cancel()  # 请求取消任务

    try:
        await task
    except asyncio.CancelledError:
        print("主协程: Task 被取消")


asyncio.run(main())

"""
输出：
Task 启动
Task 被取消
主协程: Task 被取消
"""
```



##### **给任务设置超时时间**

asyncio 通过名为 asyncio.wait_for 的函数提供此功能，该函数接收协程或任务，以及以秒为单位的超时时间。如果任务完成所需的时间超过了设定的超时时间，则会引发 TimeoutError，任务将自动取消。

如果直接 await 一个任务，那么必须等到任务完成之后才能继续往下执行。如果任务一直完成不了，那么就会一直陷入阻塞。我们的目的是希望这个任务的执行时间是可控的，那么便可以使用 wait_for 并指定超时时间。注：使用 wait_for 必须要搭配 await，阻塞等待任务完成并拿到返回值、或者达到超时时间引发 TimeoutError 之后，程序才能往下执行。

```python
import asyncio

async def get_html(seconds):
    print("开始下载页面")
    await asyncio.sleep(seconds)
    return f"{seconds} 秒后下载完成"

async def main():
    task = asyncio.create_task(get_html(2))
    try:
        result = await asyncio.wait_for(task, 1)
        print("返回值:", result)
    except asyncio.TimeoutError:
        print("超时啦")
        # task.cancelled() 用于判断任务是否被取消
        # 任务被取消：返回 True，没有被取消：返回 False
        print("任务是否被取消:", task.cancelled())


asyncio.run(main())
"""
开始下载页面
超时啦
任务是否被取消: True
"""
```

##### **忽略取消任务**

使用 asyncio.shield 函数防止传入的任务被取消，会给它一个屏蔽，将取消请求将忽略掉。

```python
import asyncio

async def get_html(seconds):
    print("开始下载页面")
    await asyncio.sleep(seconds)
    return f"{seconds} 秒后下载完成"

async def main():
    task = asyncio.create_task(get_html(2))
    try:
        # 通过 asyncio.shield 将 task 保护起来
        result = await asyncio.wait_for(asyncio.shield(task), 1)
        print("返回值:", result)
    except asyncio.TimeoutError:
        print("超时啦")
        # 如果超时依旧会引发 TimeoutError，但和之前不同的是
        # 此时任务不会被取消了，因为 asyncio.shield 会将取消请求忽略掉
        print("任务是否被取消:", task.cancelled())
        # 从出现超时的地方，继续执行，并等待它完成
        result = await task
        print("返回值:", result)


asyncio.run(main())
"""
开始下载页面
超时啦
任务是否被取消: False
返回值: 2 秒后下载完成
"""
```



#### 并发运行协程

对于单个异步协程函数，可以直接使用 asyncio.run 进行调用。

而对于多个异步协程函数，想要并发运行，则需要通过 asyncio.create_task 将协程包装成任务在事件循环上进行注册。

```python
import asyncio

async def func1():
    ...

async def func2():
    ...

async def func3():
    ...

async def main():
    task1 = asyncio.create_task(func1())
    task2 = asyncio.create_task(func2())
    task3 = asyncio.create_task(func3())
    
   	await task1
    await task2
    await task3
    
asyncio.run(main())
```

除了上面的方法，还可以使用 `asyncio.gather` ，这个函数接收一系列的可等待对象，允许我们在一行代码中同时运行它们。如果传入的 awaitable 对象是协程，gather 函数会自动将其包装成任务，以确保它们可以同时运行。这意味着不必像之前那样，用 asyncio.create_task 单独包装

asyncio.gather 同样返回一个 awaitable 对象，在 await 表达式中使用它时，它将暂停，直到传递给它的所有 awaitable 对象都完成为止。一旦==所有任务都完成==，asyncio.gather 将返回这些任务的结果所组成的列表。

```python
import asyncio

async def func1():
    ...

async def func2():
    ...

async def func3():
    ...

async def main():
    funcList = [func1(),func2(),func3()]
    results = await asyncio.gather(*funcList)
    
asyncio.run(main())

```

另外传给 gather 的每个 awaitable 对象可能不是按照确定性顺序完成的，例如将协程 a 和 b 按顺序传递给 gather，但 b 可能会在 a 之前完成。不过 gather 的一个很好的特性是，不管 awaitable 对象何时完成，都保证结果会按照传递它们的顺序返回。

如果 gather 里面啥都不传的话，那么会返回一个空列表。

然后 gather 还可以实现分组

```python
import asyncio
import time

async def main():
    gather1 = asyncio.gather(
        *[asyncio.sleep(second, result=f"我睡了 {second} 秒")
          for second in (5, 3, 4)]
    )
    gather2 = asyncio.gather(
        *[asyncio.sleep(second, result=f"我睡了 {second} 秒")
          for second in (3, 3, 3)]
    )
    results = await asyncio.gather(
        gather1, gather2, asyncio.sleep(6, "我睡了 6 秒")
    )
    print(results)


start = time.perf_counter()
asyncio.run(main())
end = time.perf_counter()
print("总耗时:", end - start)
"""
[['我睡了 5 秒', '我睡了 3 秒', '我睡了 4 秒'], 
 ['我睡了 3 秒', '我睡了 3 秒', '我睡了 3 秒'], 
 '我睡了 6 秒']
总耗时: 6.002826208
"""
```

假如其中某个任务出现异常时，不管正常执行结束还是出错，都代表任务已完成，会将结果和异常都收集起来，只不过其中肯定有一个为 None。然后根据不同的情况，选择是否将异常抛出来。所以在 asyncio 里面，异常只是一个普通的属性，会保存在任务对象里面。

对于 asyncio.gather 也是同理，它里面有一个 return_exceptions 参数，默认为 False，当任务出现异常时，会抛给 await 所在的位置。如果该参数设置为 True，那么出现异常时，会直接把异常本身返回（此时任务也算是结束了）。

```python
import asyncio

async def func1():
    ...

async def func2():
    ...

async def func3():
    ...

async def main():
    funcList = [func1(),func2(),func3()]
    results = await asyncio.gather(return_exceptions=True,*funcList)
    # return_exceptions 默认是False，即出现异常会继续向上抛出。
    # 设为 True 则将异常对象进行返回，如果 isinstance(res, Exception) 为 True，那么证明任务出现了异常，否则正常执行
asyncio.run(main())
```

asyncio.gather 有两个缺点：

- 如果希望所有任务都执行成功，要是有一个任务失败，其他任务自动取消。gather 无法实现
- gather 是必须等待所有任务执行完成，才能返回结果列表，假如其中某个任务是耗时任务，但其他的任务并不是耗时任务，这就存在一个问题，耗时短的任务都得等待耗时长的任务一起返回。

**在任务完成时立即处理**

前面提到 gather 需要等待所有对象执行完毕，这就可能导致应用程序变得无法响应。

为了解决上述问题，可以使用 asyncio 的 `as_completed` 函数。该函数接收一个可等待对象（awaitable）组成的列表，并返回一个生成器。当遍历这个生成器的时候，哪个任务先完成则哪个就先被处理，也就是说一旦有任务完成，它就会被迭代出来。由于无法无法保证哪些请求先完成，因此也就没有所谓的顺序。

```python
import asyncio

async def func1():
    return 1

async def func2():
    return 2

async def func3():
    return 3

async def main():
    tasks = [func1(),func2(),func3()]
    for finished in asyncio.as_completed(tasks):
        print(await finished)

asyncio.run(main())
```



如果想为一组 任务 设置超时，`as_completed` 函数有一个可选的参数 `timeout` 可以设置，它允许以秒为单位指定超时时间。如果花费的时间超过设定的时间，那么迭代器中的每个可等待对象都会在等待时抛出 TimeoutException。==虽然抛出了异常，但是未完成的任务不会受到影响，它们仍然在后台执行==

```python
import asyncio

async def delay(seconds):
    await asyncio.sleep(seconds)
    return f"我睡了 {seconds} 秒"

async def main():
    tasks = [asyncio.create_task(delay(seconds))
             for seconds in (1, 5, 6)]
    for finished in asyncio.as_completed(tasks, timeout=3):
        try:
            print(await finished)
        except asyncio.TimeoutError:
            print("超时啦")

    # tasks[1] 还需要 2 秒运行完毕，tasks[2] 还需要 3 秒运行完毕
    print(tasks[1].done(), tasks[2].done())

    await asyncio.sleep(2)
    # 此时只剩下 tasks[2]，还需要 1 秒运行完毕
    print(tasks[1].done(), tasks[2].done())

    await asyncio.sleep(1)
    # tasks[2] 也运行完毕
    print(tasks[1].done(), tasks[2].done())


loop = asyncio.get_event_loop()
loop.run_until_complete(main())
"""
我睡了 1 秒
超时啦
超时啦
False False
True False
True True
"""
```

`as_completed`函数的缺点：

- 生成器迭代的结果是不确定的，即无法判断任务的运行顺序，如果不关心顺序，可能没什么问题。
- 虽然会正确地抛出异常并继续运行程序，但创建的所有任务仍将在后台运行。如果想取消它们，很难确定哪些任务仍在运行，这是我们面临的另一个挑战。



#### wait 进行细粒度控制

gather 和 as_completed 的缺点之一是，当我们看到异常时，没有简单的方法可以取消已经在运行的任务。这在很多情况下可能没问题，但是想象一个场景：同时发送大批量 Web 请求（参数格式是相同的），如果某个请求的参数格式错误（说明所有请求的参数格式都错了），那么剩余的请求还有必要执行吗？显然是没有必要的，而且还会消耗更多资源。另外 as_completed 的另一个缺点是，由于迭代顺序是不确定的，因此很难准确跟踪已完成的任务。

于是 asyncio 提供了 wait 函数，注意它和 wait_for 的区别，wait_for 针对的是单个任务，而 wait 则针对一组任务（不限数量）。

然后是 wait 函数的返回值，它会返回两个集合：一个由已完成的任务（执行结束或出现异常）组成的集合，另一个由未完成的任务组成的集合。而 wait 函数的参数，它除了可以接收一个任务列表之外，还可以接收一个 timeout（超时时间）和一个 return_when（用于控制返回条件）。

**等待所有任务完成**

如果未指定 retun_when，则此选项使用默认值

```python
import asyncio

async def delay(seconds):
    await asyncio.sleep(seconds)
    return f"我睡了 {seconds} 秒"

async def main():
    tasks = [asyncio.create_task(delay(seconds)) for seconds in (3, 2, 4)]
    # 和 gather 一样，默认会等待所有任务都完成
    done, pending = await asyncio.wait(tasks)
    print(f"已完成的任务数: {len(done)}")
    print(f"未完成的任务数: {len(pending)}")

    for done_task in done:
        print(await done_task)


asyncio.run(main())
"""
已完成的任务数: 3
未完成的任务数: 0
我睡了 2 秒
我睡了 4 秒
我睡了 3 秒
"""
```

await asynio.wait 时，会返回两个集合，分别保存已完成的任务和未完成但仍然运行的任务。并且由于返回的是集合，所以是无序的。默认情况下，asyncio.wait 会等到所有任务都完成后才返回，所以待处理集合的长度为 0。

如果某个任务执行时出现异常

```python
import asyncio

async def delay(seconds):
    await asyncio.sleep(seconds)
    if seconds == 3:
        raise ValueError("我出错了(second is 3)")
    return f"我睡了 {seconds} 秒"

async def main():
    tasks = [asyncio.create_task(delay(seconds)) for seconds in range(1, 6)]
    done, pending = await asyncio.wait(tasks)
    print(f"已完成的任务数: {len(done)}")
    print(f"未完成的任务数: {len(pending)}")


asyncio.run(main())
"""
已完成的任务数: 5
未完成的任务数: 0
Task exception was never retrieved
future: <Task finished ... coro=<delay() done, defined at .../main.py:3> 
         exception=ValueError('我出错了(second is 3)')>
    ......
    raise ValueError("我出错了(second is 3)")
ValueError: 我出错了(second is 3)
"""
```

对于 asyncio.gather 而言，如果某个任务出现异常，那么异常会向上抛给 await 所在的位置。如果不希望它抛，那么可以将 gather 里面的 return_exceptions 参数指定为 True，这样当出现异常时，会将异常返回。

而 asyncio.wait 也是如此，如果任务出现异常了，那么会直接视为已完成，异常同样不会向上抛。但是从程序开发的角度来讲，返回值可以不要，但异常不能不处理。

所以当任务执行出错时，虽然异常不会向上抛，但 asyncio 会将它打印出来，于是就有了：Task exception was never retrieved。意思就是该任务出现异常了，但你没有处理它。

当拿到wait 函数返回的 已完成任务后，需要我们手动地去获取任务返回的数据

```python
async def main():
    tasks = [asyncio.create_task(delay(seconds)) for seconds in range(1, 6)]
    # done 里面保存的都是已完成的任务
    done, pending = await asyncio.wait(tasks)
    print(f"已完成的任务数: {len(done)}")
    print(f"未完成的任务数: {len(pending)}")

    # 所以我们直接遍历 done 即可
    for done_task in done:
        # 这里不能使用 await done_task，因为当任务完成时，它就等价于 done_task.result()
        # 而任务出现异常时，调用 result() 是会将异常抛出来的，所以我们需要先检测异常是否为空
        exc = done_task.exception()
        if exc:
            print(exc)
        else:
            print(done_task.result())
```

这里调用 result 和 exception 有一个前提，就是任务必须处于已完成状态，否则会抛异常：InvalidStateError: Result is not ready.。但对于我们当前是没有问题的，因为 done 里面的都是已完成的任务。

这里能再次看到和 gather 的区别，gather 会帮你把返回值都取出来，放在一个列表中，并且顺序就是任务添加的顺序。而 wait 返回的是集合，集合里面是任务，我们需要手动拿到返回值。

**某个完成出现异常时取消其它任务**

如果希望任务列表中某个任务出现异常时，立即取消其他任务。这就需要设置 wait 函数 的 return_when 参数。

return_when有三个可选值:

- asyncio.ALL_COMPLETED：等待所有任务完成后返回；

- asyncio.FIRST_COMPLETED：有一个任务完成就返回；

- asyncio.FIRST_EXCEPTION：当有任务出现异常时返回；

显然为完成这个需求，我们应该将 return_when 指定为 FIRST_EXCEPTION。

之后wait 返回时，未完成的任务仍在后台继续运行，如果我们希望将剩余未完成的任务取消掉，那么直接遍历 pending 集合即可。

```python
async def main():
    tasks = [asyncio.create_task(delay(seconds)) for seconds in range(1, 6)]
    # done 里面保存的都是已完成的任务
    done, pending = await asyncio.wait(tasks,return_when=asyncio.FIRST_EXCEPTION)
    print(f"已完成的任务数: {len(done)}")
    print(f"未完成的任务数: {len(pending)}")

   # 此时未完成的任务仍然在后台运行，这时候我们可以将它们取消掉
    for t in pending:
        t.cancel()
    # 阻塞 3 秒
    await asyncio.sleep(3)
```

注：出现异常的任务会被挂在已完成集合里面，如果没有任务在执行时出现异常，那么效果等价于 ALL_COMPLETED。

ALL_COMPLETED 和 FIRST_EXCEPTION 都有一个缺点，在任务成功且不抛出异常的情况下，必须等待所有任务完成。对于之前的用例，这可能是可以接受的，但如果想要在某个协程成功完成后立即处理结果，那么现在的情况将不能满足我们的需求。

虽然这个场景可使用 as_completed 实现，但 as_completed 的问题是没有简单的方法可以查看哪些任务还在运行，哪些任务已经完成。因为遍历的时候，我们无法得知哪个任务先完成，所以 as_completed 无法完成我们的需求。

好在 wait 函数的 return_when 参数可以接收 FIRST_COMPLETED 选项，表示只要有一个任务完成就立即返回，而返回的可以是执行出错的任务，也可以是成功运行的任务（任务失败也表示已完成）。然后，我们可以取消其他正在运行的任务，或者让某些任务继续运行，具体取决于用例。

当 return_when 参数为 FIRST_COMPLETED 时，那么只要有一个任务完成就会立即返回，然后我们处理完成的任务即可。至于剩余的任务，它们仍在后台运行，我们可以继续对其使用 wait 函数。

```python
async def main():
    tasks = [asyncio.create_task(delay(seconds))
             for seconds in range(1, 6)]
    while True:
        done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
        for t in done:
            exc = t.exception()
            print(exc) if exc else print(t.result())

        if pending:  # 还有未完成的任务，那么继续使用 wait
            tasks = pending
        else:
            break
```

整个行为和 as_completed 是一致的，但这种做法有一个好处，就是我们每一步都可以准确地知晓哪些任务已经完成，哪些任务仍然运行，并且也可以做到精确取消指定任务。

**超时处理**

除了允许对如何等待协程完成进行更细粒度的控制外，wait 还允许设置超时，以指定我们希望等待完成的时间。要启用此功能，可将 timeout 参数设置为所需的最大秒数，如果超过了这个超时时间，wait 将立即返回 done 和 pending 任务集。

不过与目前所看到的 wait_for 和 as_completed 相比，超时在 wait 中的行为方式存在一些差异。

- 协程不会被取消。

  当使用 wait_for 时，如果任务超时，则引发 TimeouError，并且任务也会自动取消。但使用 wait 的情况并非如此，它的行为更接近我们在 as_completed 中看到的情况。如果想因为超时而取消协程，必须显式地遍历任务并取消，否则它们仍在后台运行。

- 不会引发超时错误。

  如果发生超时，则 wait 返回所有已完成的任务，以及在发生超时的时候仍处于运行状态的所有任务。

和之前一样，pending 集合中的任务不会被取消，并且继续运行，尽管会超时。对于要终止待处理任务的情况，我们需要显式地遍历 pending 集合并在每个任务上调用 cancel。

