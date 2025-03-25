#### 查看conda版本

```shell
conda --version
```

#### 设置镜像

```shell
#设置清华镜像
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main/
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/conda-forge/
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/bioconda/
#设置bioconda
conda config --add channels bioconda
conda config --add channels conda-forge
#设置搜索时显示通道地址
conda config --set show_channel_urls yes
```

#### 更新conda

```shell
conda update conda
```

#### 创建环境

```shell
conda create -n envName python=3.11
```

#### 查看环境

```shell
conda env list
conda info -e
```

#### 激活环境

```shell
conda activate envName
```

#### 退出环境

```shell
conda activate
conda deactivate
# activate的缺省值是base，deactivate的缺省值是当前环境
```

#### 删除环境

```shell
conda remove --name envName --all
conda remove --name envName packageName
```

