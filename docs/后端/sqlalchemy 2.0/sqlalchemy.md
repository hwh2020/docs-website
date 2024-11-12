### 一、Engine

Engine 是任何 SQLAlchemy 应用程序的起点

 ![](sqlalchemy_imgs/sqla_engine_arch.png)

同步：

```python
from sqlalchemy import create_engine

DB_URL = f"mysql+pymysql://{USERNAME}:{PASSWORD}@{HOSTNAME}:{PORT}/{DATABASE}"
engine = create_engine(DB_URL, echo=True)
```

 异步：

```python
from sqlalchemy.ext.asyncio import create_async_engine

DB_URL = f"mysql+asyncmy://{USERNAME}:{PASSWORD}@{HOSTNAME}:{PORT}/{DATABASE}"
async_engine = create_async_engine(DB_URL, echo=True)
```



create_engine 常用可选参数：

- `echo=False`

  如果设置为 True，Engine 将会把所有语句以及它们参数列表的 `repr()` 表示记录到默认的日志处理器中，该处理器默认将输出到 `sys.stdout`。如果将其设置为字符串 `"debug"`，则结果行也将被打印到标准输出。

- `pool_size=5`

   连接池的大小，0表示连接数无限制

- `pool_recycle=-1` 

  连接池回收连接的时间，如果设置为-1，表示没有no timeout, 注意，MySQL 默认情况下如果一个连接8小时内容没有任何动作（查询请求）就会自动断开链接，出现 MySQL has gone away的错误。设置了 pool_recycle 后 SQLAlchemy 就会在指定时间内回收连接。如果设置为3600 就表示 1小时后该连接会被自动回收。

- `pool_pre_ping` 

  如果值为True，那么每次从连接池中拿连接的时候，都会向数据库发送一个类似 select 1 的测试查询语句来判断服务器是否正常运行。当该连接出现 disconnect 的情况时，该连接连同pool中的其它连接都会被回收。

- `pool_timeout=30`

  在放弃从连接池中获取连接之前等待的秒数。即在连接池获取一个空闲连接等待的时间

- `max_overflow=-1`

  连接池中的连接数已达到预设的pool_size（池大小）且这些连接都被使用时，允许再新建的连接数的最大值。如果设置为-1，表示连接池中可以创建任意数量的连接



### 二、Connection

当调用 `connect` 时，实际是从池子中取出了一个链接，调用`connection.close()`之后，由`connect`函数创建的连接会被释放到连接池中, 可以供下次使用

同步

```python
from sqlalchemy import text

# 手动 commit()
with engine.connect() as conn:
    results = conn.execute(text("SELECT x, y FROM users"))
    print(result.all())
    conn.execute(text("CREATE TABLE demo (x int, y int)"))
    conn.commit()

# 自动commit()
with engine.begin() as conn:
    conn.execute(text("CREATE TABLE demo (x int, y int)"))
```

异步

```python
from sqlalchemy import MetaData

async with async_engine.connect() as conn:
    results = await conn.execute(text("SELECT x, y FROM users"))
```

这里执行的“SELECT”字符串选择了我们表中的所有行。返回的对象称为 `Result`，表示结果行的可迭代对象。

`Result` 有许多用于获取和转换行的方法, 例如之前`Result.all()` 方法，它返回所有 `Row` 对象的列表。它还实现了 Python 迭代器接口，以便我们可以直接对 `Row` 对象的集合进行迭代。

- 元组赋值

  ```python
  result = conn.execute(text("select x, y from some_table"))
  
  for x, y in result:
      ...
  ```

- 整数索引

  ```python
  result = conn.execute(text("select x, y from some_table"))
  
  for row in result:
      x = row[0]
  ```

- 属性名称

  ```python
  result = conn.execute(text("select x, y from some_table"))
  
  for row in result:
      y = row.y
  
      # illustrate use with Python f-strings
      print(f"Row: {row.x}  {y}")
  ```

`Connection.execute()`方法也接受参数，这些参数被称为绑定参数, `text()`构造函数使用冒号格式“`:y`”接受这些参数。

```python
with engine.connect() as conn:
	result = conn.execute(text("SELECT x, y FROM some_table WHERE y > :y"), {"y": 2})
    for row in result:
    	print(f"x: {row.x}  y: {row.y}")
        
with engine.connect() as conn:
	conn.execute(text("INSERT INTO some_table (x, y) VALUES (:x, :y)"),[{"x": 11, "y": 12}, {"x": 13, "y": 14}],)
	conn.commit()
```



### 三、Session

当使用 ORM 时，与数据库交互的基本事务对象称为`Session`。实际上，当使用`Session`时，它会内部引用一个`Connection`，然后使用它来发出 SQL。

当Session结束事务后，它实际上不会保留Connection对象。它会在下次需要对数据库执行 SQL 时，从Engine 获取一个新的Connection。

可以单独构造 Session，也可以使用 sessionmaker 类。

同步

```python
from sqlalchemy.orm import Session, sessionmaker

# 单独构造
with Session(engine) as session:
    session.add(some_object)
    session.commit()

# 使用sessionmaker 配置的Session工厂
SessionLocal = sessionmaker(bind=engine)
with SessionLocal() as session:
    session.add(some_object)
    session.commit()
```

异步

```python
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

# 单独构造
async with AsyncSession(async_engine) as session:
    session.add(some_object)
    await session.commit()

# 使用async_sessionmaker 配置的Session工厂
asyncSessionLocal = async_sessionmaker(bind=engine)
async with asyncSessionLocal() as session:
    session.add(some_object)
    await session.commit()
```

在 Python 上下文管理器（即 `with / async with` 语句）中使用session，可以在代码块结束时自动关闭；这等效于调用 `Session.close() / AsyncSession.close() `方法。

调用 `Session.commit()`是可选的，只有在使用 Session 进行的操作中包含要持久化到数据库的新数据时才需要。如果我们只发出 SELECT 调用，不需要写入任何更改，那么调用 `Session.commit()` 将是不必要的。

Session 的 begin 、commit、rollback 

```python
with Session(engine) as session:
    session.begin()
    try:
        session.add(some_object)
        session.add(some_other_object)
    except:
        session.rollback()
        raise
    else:
        session.commit()

# 另一种方式
with Session(engine) as session:
    with session.begin():
        session.add(some_object)
        session.add(some_other_object)
        
 # 更加简洁的方式
with Session(engine) as session, session.begin():
    session.add(some_object)
    session.add(some_other_object)
```

sessionmaker 也提供了`sessionmaker.begin()` 方法，该方法提供了一个上下文管理器，它既可以开始和提交事务，也可以`Session`在完成时关闭事务，如果发生任何错误，则会自动回滚事务

```python
Session = sessionmaker(engine)

with Session.begin() as session:
    session.add(some_object)
    session.add(some_other_object)
```



### 四、ORM

#### 创建数据表

```python
from typing import Union
from datetime import datetime
from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import Mapped,mapped_column, DeclarativeBase,

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "user_account"
    id: Mapped[int] = mapped_column(primary_key=True,index=True, autoincrement=True, comment="主键id")
    uuid: Mapped[str] = mapped_column(String(50), init=False, default_factory=uuid4_str, unique=True)
    name: Mapped[str] = mapped_column(String(50),unique=True,index=True,comment="用户名")
    password: Mapped[str | None] = mapped_column(String(255), comment='密码')
    salt: Mapped[str | None] = mapped_column(String(5), comment='加密盐')
    email: Mapped[str] = mapped_column(String(50), unique=True, index=True, comment='邮箱')
    is_superuser: Mapped[bool] = mapped_column(default=False, comment='超级权限(0否 1是)')
    is_staff: Mapped[bool] = mapped_column(default=False, comment='后台管理登陆(0否 1是)')
    status: Mapped[int] = mapped_column(default=1, comment='用户账号状态(0停用 1正常)')
    is_multi_login: Mapped[bool] = mapped_column(default=False, comment='是否重复登陆(0否 1是)')
    avatar: Mapped[str | None] = mapped_column(String(255), default=None, comment='头像')
    phone: Mapped[str | None] = mapped_column(String(11), default=None, comment='手机号')
    remark: Mapped[str | None] = mapped_column(LONGTEXT, default=None, comment='备注')
    join_time: Mapped[datetime] = mapped_column(init=False, default_factory=timezone.now, comment='注册时间')
    last_login_time: Mapped[datetime | None] = mapped_column(init=False, onupdate=timezone.now, comment='上次登录')
    # 部门用户一对多
    dept_id: Mapped[int | None] = mapped_column(
        ForeignKey('sys_dept.id', ondelete='SET NULL'), default=None, comment='部门关联ID'
    )
    dept: Mapped[Union['Dept', None]] = relationship(init=False, back_populates='users') 
    # 用户角色多对多
    roles: Mapped[list['Role']] = relationship( 
        init=False, secondary=sys_user_role, back_populates='users'
    )

```



#### 查询

同步

```python
from sqlalchemy import func, and_, select

SessionLocal = sessionmaker(bind=engine)

with SessionLocal.begin() as session:
    # 查对象数据
    user_sql = select(User).where(User.id==1)
    user = session.execute(user_sql).scalars.first()
    users_sql = select(User).where(User.status == 1)
    users = session.execute(users_sql).scalars().all()
    
    # 按照 id 查询还有一个快捷方式：
	user = session.get(User, pk=1)
    
    # 标量
    count_sql = select(func.count(User.id)).where(User.status == 1)
    count = session.scalars(count_sql).one()
    
    name_sql = select(User.name) # 单列
    names = session.scalars(name_sql).all()
    
    query = select(User.name, User.email) # 多列，但不是整个对象
    result = session.execute(query).all()
    
    # 如果想直接返回查询到的对象，但是并不想该对象影响到sql数据库
    user_sql = select(User).where(User.id==1)
    user = session.execute(user_sql).scalars.first()
    session.expunge(user)
    return user

```

`scalars()` 方法在 SQLAlchemy 2.0 中用于从查询结果中提取标量值或对象，当你查找整个对象的时候

当你查询单个列时，`scalars()` 方法会提取这些标量值。

当你查询多列但不是整个对象时，`scalars()` 方法默认提取第一列的值。你可以通过参数指定提取其他列的值。

当你查询整个对象时，`scalars()` 方法会提取这些对象。



`session.expunge(data)` 方法用于从 SQLAlchemy 的会话（Session）中移除一个对象，这意味着该对象将不再被会话跟踪。当你对一个对象调用 `expunge` 方法后，SQLAlchemy 将不再管理这个对象的生命周期，包括它的更改（如添加、修改或删除）将不会被自动同步到数据库中。



异步

```python
asyncSessionLocal = async_sessionmaker(bind=engine)
async with asyncSessionLocal.begin() as session:
     # 查对象数据
    user_sql = select(User).where(User.id==1)
    user = (await session.execute(user_sql)).scalars.first()
    users_sql = select(User).where(User.status == 1)
    users = (await session.execute(users_sql)).scalars().all()
    
    # 标量
    count_sql = select(func.count(User.id)).where(User.status == 1)
    count = (await session.scalars(count_sql)).one()
    
    name_sql = select(User.name) # 单列
    names = (await session.scalars(name_sql)).all()
    
    query = select(User.name, User.email) # 多列，但不是整个对象
    result = (await session.execute(query)).all()
```

#### 新增

```python
# 添加对象直接使用 session.add 方法
SessionLocal = sessionmaker(bind=engine)

with SessionLocal.begin() as session:
    session.add(user)
    # 如果要获取插入后的 ID，当然也可以 commit 之后再读
	session.flush()   # flush 并不是 commit，并没有提交事务，应该是可重复读，和数据库的隔离级别有关。
	print(user.id)
    
#################################
# 异步

asyncSessionLocal = async_sessionmaker(bind=engine)
async with asyncSessionLocal.begin() as session:
    session.add(user)
    await session.flush()
    
```

#### 编辑

```python
from sqlalchemy import update

asyncSessionLocal = async_sessionmaker(bind=engine)
async with asyncSessionLocal.begin() as session:
    # 更新id为1的数据，并把name改为mrhow age改为18
    _sql = update(User).where(User.id==1).values(name="mrhow",age=18)
    await session.execute(_sql)
    
    # 或者直接对属性赋值
    user.name = "mrhow"
    user.age = 18
    await session.commit()

```



#### 删除

删除一般都是软删除

物理删除（硬删除）：

```python
asyncSessionLocal = async_sessionmaker(bind=engine)
async with asyncSessionLocal.begin() as session:
    # 查到后删除
    _sql = select(User).where(User.id==1)
    user = (await session.execute(_sql)).scalars().first()
    session.delete(user)
```



### 五、其他

#### 加载外键关联模型

如果我们在读取一个 N 个记录的列表之后，再去数据库中一一读取每个项目的具体值，就会产生 N+1 个 查询。这就是数据库中最常犯的错误：N+1 问题。

默认情况下，查询中不会加载外键关联的模型，可以使用 selectinload 选项来加载外键，从而避免 N+1 问题。`select(Model).options(selectinload(Model.field))`

```python
session.execute(select(User)).scalars().all()  # 没有加载 parent 外键
session.execute(select(User).options(selectinload(User.groups))).scalars().all()
```

Selectinload 的原理在于使用了 `select in` 子查询，这也是名字的又来。除了 selectinload 外， 还可以使用传统的 joinedload，它的原理就是最普通的 join table

```python
# 使用 joinedload 加载外键，注意需要使用 unique 方法，这是 2.0 中规定的。
session.execute(select(User).options(joinedload(User.groups))).unique().scalars().all()
```

在 2.0 中，更推荐使用 selectinload 而不是 joinedload，一般情况下，selectinload 都要好， 而且不用使用 unique.



#### 批量插入

当需要插入大量数据的时候，如果依然采用逐个插入的方法，那么就会在和数据库的交互上浪费很多 时间，效率很低。MySQL 等大多数数据库都提供了 `insert ... values (...), (...) ...` 这种 批量插入的 API，在 SQLAlchemy 中也可以很好地利用这一点。

```python
# 使用 session.bulk_save_objects(...) 直接插入多个对象

s = Session()
objects = [
    User(name="u1"),
    User(name="u2"),
    User(name="u3")
]
s.bulk_save_objects(objects)
s.commit()

# 使用 bulk_insert_mappings 可以省去创建对象的开销，直接插入字典
users = [
    {"name": "u1"},
    {"name": "u2"},
    {"name": "u3"},
]
s.bulk_insert_mappings(User, users)
s.commit()

# 使用 bulk_update_mappings 可以批量更新对象，字典中的 id 会被用作 where 条件，
# 其他字段全部用于更新
session.bulk_update_mappings(User, users)
```



#### sqlalchemy 模型 转 pytantic 模型

```python
from typing import Container, Optional, Type
from pydantic import BaseModel, ConfigDict, create_model

orm_config = ConfigDict(from_attributes=True)

def sqlalchemy_to_pydantic(
    db_model: Type, *, config: Type = orm_config, exclude: Container[str] = []
) -> Type[BaseModel]:
    table = db_model.metadata.tables[db_model.__tablename__]
    fields = {}
    for column in table.columns:
        name = column.name
        if name in exclude:
            continue
        python_type: Optional[type] = None
        if hasattr(column.type, "impl"):
            if hasattr(column.type.impl, "python_type"):
                python_type = column.type.impl.python_type
        elif hasattr(column.type, "python_type"):
            python_type = column.type.python_type
        assert python_type, f"Could not infer python_type for {column}"

        if not column.nullable:
            fields[name] = (python_type, ...)
        else:
            fields[name] = (Optional[python_type], None)

    pydantic_model = create_model(db_model.__name__, __config__=config, **fields)
    return pydantic_model


```



#### sqlalchemy 对象 序列化

```python
class User(Base):
    id: Mapped[int] = mapped_column(primary_key=True,index=True, autoincrement=True, comment="主键id")
    uuid: Mapped[str] = mapped_column(String(50), init=False, default_factory=uuid4_str, unique=True)
    name: Mapped[str] = mapped_column(String(50),unique=True,index=True,comment="用户名")
    
	def to_dict(self):
		return {c.name: getattr(self, c.name, None) for c in self.__table__.columns}
    
    
asyncSessionLocal = async_sessionmaker(bind=engine)
async with asyncSessionLocal.begin() as session:
     # 查对象数据
    user_sql = select(User).where(User.id==1)
    user = (await session.execute(user_sql)).scalars.first()
    user_dict = user.to_dict()
```

