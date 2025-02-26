### 一、Docker部署MinIO

**创建两个文件目录：一个用来存放 MinIO 的配置文件，一个用来存储我们上传文件数据。**

```sh
mkdir -p /home/minio/config
mkdir -p /home/minio/data
```

- `/home/minio/config` 用于存放 MinIO 的配置文件
- `/home/minio/data` 用于存储上传的文件数据

docker

```sh
docker run -p 9000:9000 -p 9001:9001 \
-d --restart=always \
-e "MINIO_ACCESS_KEY=admin" \
-e "MINIO_SECRET_KEY=password" \
-v /home/minio/data:/data \
-v /home/minio/config:/root/.minio \
minio/minio server \
/data \
--console-address ":9001" 
```



DdJfUu1NIfPV7uFjowX7

1LvYoftxi3jJ2j8YpAbZgNRRmQmEZzfcQrC8YDbP



### 二、使用aio-pika集成到fastapi上

```python
# -*- coding: utf-8 -*-
"""
@Time : 2025/2/12 17:27
@Author : Mr.how
@Des: xxx
"""

import os
import json
from typing import Any
from minio import Minio
from minio.error import S3Error
from datetime import timedelta
from minio.commonconfig import REPLACE, CopySource
from minio.deleteobjects import DeleteObject
from app.core.logger import logger
from app.settings.config import settings



class Bucket(object):


    def __init__(self,secure:bool=False):
        endpoint = settings.MINIO_ENDPOINT
        access_key = "xxx"
        secret_key = "xxx"

        self.endpoint = endpoint
        self.access_key = access_key
        self.secret_key = secret_key
        self.secure = secure
        self.client = Minio(
            endpoint=self.endpoint,
            access_key=self.access_key,
            secret_key=self.secret_key,
            secure=self.secure
        )

    def exists_bucket(self, bucket_name: str) -> bool:
        """
        判断桶是否存在
        """
        return self.client.bucket_exists(bucket_name)

    def create_bucket(self, bucket_name:str,is_policy:bool=True) -> bool:
        """
        创建桶 并赋予策略
        """
        if self.exists_bucket(bucket_name):
            return False
        else:
            self.client.make_bucket(bucket_name)
        if is_policy:
            policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {"AWS": ["*"]},  # 表示任何用户都可以执行这些操作
                        "Action": ["s3:GetBucketLocation", "s3:ListBucket"],  # 允许的操作包括
                        "Resource": [f"arn:aws:s3:::{bucket_name}"]
                    },
                    {"Effect": "Allow",
                     "Principal": {"AWS": ["*"]},
                     "Action": ["s3:GetObject"],
                     "Resource": [f"arn:aws:s3:::{bucket_name}/*"]}
                ]
            }
            self.client.set_bucket_policy(bucket_name, json.dumps(policy))
        return True

    def get_bucket_list(self) -> list[dict[str, Any]]:
        """
        列出存储桶
        """
        buckets = self.client.list_buckets()
        bucket_list = []
        for bucket in buckets:
            bucket_list.append(
                {"bucket_name": bucket.name, "create_time": bucket.creation_date}
            )
        logger.debug(f"bucket_list:{bucket_list}")
        return bucket_list

    def remove_bucket(self, bucket_name:str):
        """
        删除桶
        """
        try:
            self.client.remove_bucket(bucket_name=bucket_name)
        except S3Error as e:
            print("[error]:", e)
            return False
        return True

    def get_bucket_list_files(self, bucket_name:str, prefix:str|None = None):
        """
        列出存储桶中所有对象
        """
        try:
            file_list = self.client.list_objects(bucket_name,prefix, recursive=True)
            results = []
            for obj in file_list:
                results.append(obj.object_name)
                logger.debug(f"obj:{obj}, obj_name:{obj.object_name}")
                print(obj.bucket_name, obj.object_name.encode('utf-8'), obj.last_modified,
                      obj.etag, obj.size, obj.content_type)
            logger.debug(f"file_list:{file_list}")
            return results

        except S3Error as e:
            logger.error(f"列出存储桶中所有对象异常:{e}")
            return False

    def get_bucket_policy(self, bucket_name:str):
        """
        获取桶策略
        """
        try:
            policy = self.client.get_bucket_policy(bucket_name)
            return json.loads(policy)
        except S3Error as e:
            logger.error(f"获取桶策略异常:{e}")
            return False

    def download_file(self, bucket_name:str, file_name:str, file_path:str):
        """
        从 bucket_name 下载文件 到 指定 文件中
        """
        try:
            data = self.client.get_object(bucket_name, file_name)
            with open(file_path, 'wb') as file_data:
                for d in data.stream(32*1024):
                    file_data.write(d)
        except S3Error as e:
            logger.error(f"从 bucket_name 下载文件 到 指定 文件中异常:{e}")
            return False

    def fget_file(self, bucket_name, file, file_path):
        """
        下载保存文件保存本地
        """
        self.client.fget_object(bucket_name, file, file_path)

    def copy_file(self, bucket_name, file, sourcebucket:str, sourcefile:str):
        """
        拷贝文件（最大支持5GB）
        """
        self.client.copy_object(bucket_name=bucket_name, object_name=file, source=CopySource(sourcebucket, sourcefile))

    def upload_file(self, bucket_name, file, file_path, content_type):
        """
        上传文件 + 写入
        :param bucket_name: 桶名
        :param file: 文件名
        :param file_path: 本地文件路径
        :param content_type: 文件类型
        :return:
        """
        try:
            with open(file_path, "rb") as file_data:
                file_stat = os.stat(file_path)
                self.client.put_object(bucket_name, file, file_data, file_stat.st_size, content_type=content_type)
        except S3Error as e:
            print("[error]:", e)

    def fput_file(self, bucket_name, file, file_path, content_type):
        """
        上传文件
        若文件已存在，会直接覆盖
        """
        try:
            self.client.fput_object(bucket_name=bucket_name, object_name=file, file_path=file_path, content_type=content_type)
        except S3Error as e:
            print("[error]:", e)

    def stat_object(self, bucket_name, file):
        """
        获取文件元数据
        """
        try:
            data = self.client.stat_object(bucket_name, file)
            print(data.bucket_name)
            print(data.object_name)
            print(data.last_modified)
            print(data.etag)
            print(data.size)
            print(data.metadata)
            print(data.content_type)
        except S3Error as e:
            print("[error]:", e)

    def remove_file(self, bucket_name, file):
        """
        移除单个文件
        """
        self.client.remove_object(bucket_name, file)

    def remove_files(self, bucket_name, file_list):
        """
        删除多个文件
        """
        delete_object_list = [DeleteObject(file) for file in file_list]
        errors = self.client.remove_objects(bucket_name, delete_object_list)
        for error in errors:
            print("error occurred when deleting object", error)


    def remove_folder(self, bucket_name, folderName):
        """
        删除文件夹
        """
        objects_to_delete = self.client.list_objects(bucket_name, prefix=folderName, recursive=True)
        objects_to_delete = [x.object_name for x in objects_to_delete]
        logger.debug(f"objects_to_delete:{objects_to_delete}")
        objects_to_delete = [DeleteObject(x) for x in objects_to_delete]
        errors = self.client.remove_objects(bucket_name, objects_to_delete)
        for error in errors:
            print("error occurred when deleting object", error)

    def presigned_get_file(self, bucket_name, file, days=7):
        """
        生成一个http GET操作 签证URL
        """
        return self.client.presigned_get_object(bucket_name, file, expires=timedelta(days=days))


minio_client = Bucket()


```

