### pytorch基础

#### Dataset

```python
import os
from torch.utils.data import Dataset
from PIL import Image

class MyData(Dataset):
    
    def __init__(self, root_dir, label_dir):
        self.root_dir = root_dir
        self.lable_dir = lable_dir
        self.path = os.path.join(self.root_dir, self.label_dir)
        self.img_path = os.listdir(self.path)
        
     def __getitem__(self, idx):
        img_name = self.img_path[idx]
        img_item_path = os.path.join(self.root_dir, self.label_dir, img_name)
        img = Image.open(img_item_path)
        label = self.lable_dir
        
       	return img, label
    
    def __len__(self):
        return len(self.img_path)
    
root_dir = "dataset/train"
ants_label_dir = "ants"
bees_label_dir = "bees"
ants_dataset = MyData(root_dir,ants_label_dir)
bees_dataset = MyData(root_dir,bees_label_dir)

train_dataset = ants_dataset + bees_dataset # 拼接数据集
```



#### Tensorboard

`conda install -c conda-forge tensorboard`

```python
from torch.utils.tensorboard import SummaryWriter

writer = SummaryWriter("logs")

for i in range(100):
	writer.add_scalar(tag="y=x",i,i)

# writer.add_image

writer.close()
```

`tensorboard --logdir=logs --port=6006` 



#### Transforms

```python
from PIL import Image
from torchvision import transforms

img_path = "dataset/train/xxx.png"
img = Image.open(img_path)
# Tensor
tensor_trans = transforms.ToTensor()
tensor_img = tensor_trans(img)
# Normalize
trans_norm = transforms.Normalize([0.5,0.5,0.5],[0.5,0.5,0.5])
img_norm = trans_norm(img_tensor)
# Resize
print(img.size)
trans_resize = transfroms.Resize((512,512))
	# img PIL -> resize -> img_resize PIL
img_resize = trans_resize(img)
img_resize = trans_trans(img_resize)
print(img_resize.size)

# Compose 是一次性将所需要的变换集中起来转变
trans_compose = transforms.Compose([trans_resize,trans_trans])
img_resize = trans_compose(img)

# RandomCrop 随机裁剪
trans_random = transforms.RandomCrop(512)
trans_compose_2 = transforms.Compose([trans_random, trans_trans])
for i in range(10):
    img_crop = trans_compose_2(img)
   
```



#### DataLoader

```python
import torchvision
from torch.utils.data import DataLoader

test_data = torchvision.datasets.CIFAR10("./dataset", train=False, transform=torchvision.transforms.ToTensor())

test_loader = DataLoader(dataset=test_data, batch_size=4, shuffle=True, num_workers=0,drop_last=False)

for data in test_loader:
    imgs, targets = data

```





#### 神经网络搭建

#####  基本框架

```python
from torch import nn
import torch.nn.functional as F

class Model(nn.Module):
    def __init__(self):
        super(Model, self).__init__()
        self.conv1 = nn.Conv2d(in_chennels=1,out_chennels=20,kernel_size=5)
        self.conv2 = nn.Conv2d(20,20,5)
        
    def forward(self, x):
        x = F.relu(self.conv1(x))
        return F.relu(self.conv2(x))
```

##### 卷积层

```python
import torch
import torch.nn.functional as F

input = torch.tensor([[1,2,0,3,1],
                    [0,1,2,3,1],
                    [1,2,1,0,0],
                    [5,2,3,1,1],
                    [2,1,0,1,1]])

kernel = torch.tensor([[1,2,1],
                     [0,1,0],
                     [2,1,0]])

input = torch.reshape(input, (1,1,5,5)) # batch_size, chanel, 5*5, 如果 填-1 ，代表其他维度放到-1那边，后面接具体的维数。例如（-1，1，5，5）
kernel = torch.reshape(kernel,(1,1,3,3))

ouput = F.conv2d(input, kernel,stride=1,) # 二维的卷积层 torch.nn.functional 里面的 conv2d是更细致的卷积操作


```

##### 池化层

```python
# 池化层默认步长是池化核的大小

import torch
from torch import nn

input = torch.tensor([[1,2,0,3,1],
                     [0,1,2,3,1],
                     [5,2,3,1,1],
                     [2,1,0,1,1]], dtype=torch.float32) #  dtype=torch.float32 设置类型为浮点型， 即1变为1.0

input = torch.reshape(input,(-1, 1, 5, 5))
print(input.shape)

class MyModel(nn.Module):
    def __init__(self):
        super(MyModel,self).__init__()
        self.maxpool = MaxPool2d(kernel_size=3, ceil_mode=True) # ceil_mode=True 当元素不足池化核时，是否计算。
        
    def forward(self,input):
        output = self.maxpool(input)
        return output
    
# 池化的作用： 提取特征，降维
```



##### 非线性激活

```python
# 举例 ReLU激活函数

import torch
from torch import nn
from torch.nn import ReLU

input = torch.tensor([[1,-0.5],
                     [-1,3]])

output = torch.reshape(input,(-1, 1, 2, 3))

class MyModel(nn.Module):
    def __init__(self):
        super(MyModel,self).__init__()
        self.relu = ReLU(inplace=False) # inplace是否对原input进行替换
        
    def forward(self, input):
        output = self.relu(input)
        return output
model = MyModel()
output = model(input)
print(output)
```



##### Sequential

```python
import torch
from torch import nn
from torch.nn import Conv2d, MaxPool2d, Flatten, Linear, Sequential

class MyModel(nn.Module):
    def __init__(self):
        super(MyModel,self).__init__()
      
        self.model1 = Sequential(
        	Conv2d(3, 32, 5, padding=2),
            MaxPool2d(2),
            Conv2d(32,32,5, padding=2),
            MaxPool2d(2),
            Conv2d(32,64,5,padding=2),
            MaxPool2d(2), # 展开为一维
            Flatten(),
            Linear(1024,64),
            Linear(64,10)
        )
        
        
    def forward(self, x):
        x = self.model1(x)
        return x
```





#### 转换类型

- PIL类型转为Numpy类型

  ```python
  from PIL import Image
  import numpy as np
  
  img = Image.open(image_path)
  img_array = np.array(img)
  ```

  

- 