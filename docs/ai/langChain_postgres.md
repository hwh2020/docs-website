前提需求：

- 需要启动 `pgvector` 扩展的 PostgreSQL 数据库

- 本地开发时，您可以使用以下 docker 命令启动数据库：

  ```shell
  docker run --name pgvector-container -e POSTGRES_USER=langchain -e POSTGRES_PASSWORD=langchain -e POSTGRES_DB=langchain -p 6024:5432 -d pgvector/pgvector:pg16
  ```

安装;

```shell
pip install --upgrade --quiet langchain-postgres
```



步骤:

- 创建一个 `PGEngine` 实例

  ```python
  from langchain_postgres import PGEngine
  
  # See docker command above to launch a Postgres instance with pgvector enabled.
  # Replace these values with your own configuration.
  POSTGRES_USER = "langchain"
  POSTGRES_PASSWORD = "langchain"
  POSTGRES_HOST = "localhost"
  POSTGRES_PORT = "6024"
  POSTGRES_DB = "langchain"
  
  CONNECTION_STRING = (
      f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}"
      f":{POSTGRES_PORT}/{POSTGRES_DB}"
  )
  
  pg_engine = PGEngine.from_connection_string(url=CONNECTION_STRING)
  ```

  要使用 psycopg3 驱动，请将连接字符串设置为 `postgresql+psycopg：//`

- 创建存储向量的数据表

  使用该 `PGEngine.ainit_vectorstore_table()` 方法创建一个数据库表来存储文档和嵌入。该表将以相应的模式创建。

  ```python
  ABLE_NAME = "vectorstore"
  
  # The vector size (also called embedding size) is determined by the embedding model you use!
  VECTOR_SIZE = 1536
  
  
  from sqlalchemy.exc import ProgrammingError
  
  from langchain_postgres import Column
  
  try:
      await pg_engine.ainit_vectorstore_table(
          table_name=TABLE_NAME,
          vector_size=VECTOR_SIZE,
          metadata_columns=[
              Column("likes", "INTEGER"),
              Column("location", "TEXT"),
              Column("topic", "TEXT"),
          ],
      )
  except ProgrammingError:
      # Catching the exception here
      print("Table already exists. Skipping creation.")
  ```

- 配置一个带有嵌入模型的向量存储器

  ```python
  from langchain_postgres import PGVectorStore
  
  vectorstore = await PGVectorStore.create(
      engine=pg_engine,
      table_name=TABLE_NAME,
      embedding_service=embedding,
      metadata_columns=["location", "topic"],
  )
  ```

  - 添加文档

  - 删除文档

  - 相似搜索

  - 按向量搜索

  - 滤波

    