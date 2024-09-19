### 一、安装Selenium 与 浏览器驱动

#### 安装Selenium

`pip install selenium`

`pip install selenium -i https://pypi.tuna.tsinghua.edu.cn/simple`



#### 安装谷歌Chrome浏览器驱动 

[Chrome driver 官方下载地址](https://googlechromelabs.github.io/chrome-for-testing/)

对照自己谷歌浏览器的版本安装。 在帮助> 关于 google chrome 进行查看



#### 简单示例

```python
from selenium import webdriver
from selenium.webdriver.chrome.service import Service

# 创建 WebDriver 对象，指明使用chrome浏览器驱动
wd = webdriver.Chrome(service=Service(r'd:\tools\chromedriver.exe'))

# 调用WebDriver 对象的get方法 可以让浏览器打开指定网址
wd.get('https://www.baidu.com')

wd.quit()
```

> [!NOTE]
>
> 将 浏览器驱动路径写进环境变量中，即可在代码中无需指定浏览器驱动路径。即
>
> `wd = webdriver.Chrome()`



### 二、选择元素基本方法

#### 根据 `id` 属性 选择元素

 ```python
 from selenium import webdriver
 from selenium.webdriver.common.by import By
 
 # 创建 WebDriver 对象
 wd = webdriver.Chrome()
 
 # 调用WebDriver 对象的get方法 可以让浏览器打开指定网址
 wd.get('https://www.byhy.net/_files/stock1.html')
 
 # 根据id选择元素，返回的就是该元素对应的WebElement对象
 element = wd.find_element(By.ID, 'kw')   # 选的是id=kw的元素
 
 # 通过该 WebElement对象，就可以对页面元素进行操作了
 # 比如输入字符串到 这个 输入框里
 element.send_keys('通讯\n')
 ```

#### 根据 `class`属性 、`tag`名选择元素

```python
from selenium import webdriver
from selenium.webdriver.common.by import By

# 创建 WebDriver 实例对象，指明使用chrome浏览器驱动
wd = webdriver.Chrome()

# WebDriver 实例对象的get方法 可以让浏览器打开指定网址
wd.get('https://cdn2.byhy.net/files/selenium/sample1.html')

# 根据 class name 选择元素，返回的是 一个列表
# 里面 都是class 属性值为 animal的元素对应的 WebElement对象
elements = wd.find_elements(By.CLASS_NAME, 'animal')

# 取出列表中的每个 WebElement对象，打印出其text属性的值
# text属性就是该 WebElement对象对应的元素在网页中的文本内容
for element in elements:
    print(element.text)
    
    
# 根据 tag name 选择元素，返回的是 一个列表
# 里面 都是 tag 名为 div 的元素对应的 WebElement对象
elements = wd.find_elements(By.TAG_NAME, 'div')

# 取出列表中的每个 WebElement对象，打印出其text属性的值
# text属性就是该 WebElement对象对应的元素在网页中的文本内容
for element in elements:
    print(element.text)
```

> [!NOTE]
>
> `wd.find_element()` 只返回第一个元素
>
> `wd.find_elements()` 返回的元素放到列表中。
>
> 如果查找不到相应的元素，`wd.find_element()`会抛出`NoSuchElementException` 错误
>
> 而 `wd.find_elements()` 返回空列表。



#### 通过 `WebElement` 对象选择对象

不仅 WebDriver对象有 选择元素 的方法， WebElement对象 也有选择元素的方法。

WebElement对象 也可以调用 `find_elements`， `find_element` 之类的方法

WebDriver 对象 选择元素的范围是 整个 web页面， 而

WebElement 对象 选择元素的范围是 该元素的内部。

```python
from selenium import webdriver
from selenium.webdriver.common.by import By

wd = webdriver.Chrome()

wd.get('https://cdn2.byhy.net/files/selenium/sample1.html')

element = wd.find_element(By.ID,'container')

# 限制 选择元素的范围是 id 为 container 元素的内部。
spans = element.find_elements(By.TAG_NAME, 'span')
for span in spans:
    print(span.text)
```



### 三、操控元素基本方法

选择到元素之后，我们的代码会返回元素对应的 WebElement对象，通过这个对象，我们就可以 `操控` 元素了。

操控元素通常包括

- 点击元素
- 在元素中输入字符串，通常是对输入框这样的元素
- 获取元素包含的信息，比如文本内容，元素的属性



#### 点击元素

```python
from selenium import webdriver
from selenium.webdriver.common.by import By

# 创建 WebDriver 对象
wd = webdriver.Chrome()

# 调用WebDriver 对象的get方法 可以让浏览器打开指定网址
wd.get('https://www.byhy.net/_files/stock1.html')

# 根据id选择元素，返回的就是该元素对应的WebElement对象
element_input = wd.find_element(By.ID, 'kw')   # 选的是id=kw的元素

# 通过该 WebElement对象，就可以对页面元素进行操作了
# 比如输入字符串到 这个 输入框里
element_input.send_keys('通讯')

element_search = wd.find_element(By.ID, 'go') 
element_search.click()
```

> [!NOTE]
>
> 当我们调用 WebElement 对象的 click 方法去点击 元素的时候， 浏览器接收到自动化命令，点击的是该元素的 `中心点` 位置 。



#### 输入字符串

`输入字符串` 也非常简单，就是调用元素WebElement对象的send_keys方法。

如果我们要 把输入框中已经有的内容清除掉，可以使用WebElement对象的clear方法

```python
element = wd.find_element(By.ID, "input1")

element.clear() # 清除输入框已有的字符串
element.send_keys('白月黑羽') # 输入新字符串
```



#### 获取元素信息

##### 获取元素文本内容

`WebElement.text` 

通过WebElement对象的 `text` 属性，可以获取元素 `展示在界面上的` 文本内容。

```python
element = wd.find_element(By.ID, 'animal')
print(element.text)
```

但是，有时候，元素的文本内容没有展示在界面上，或者没有完全完全展示在界面上。 这时，用WebElement对象的text属性，获取文本内容，就会有问题。

出现这种情况，可以尝试使用 `element.get_attribute('innerText')` ，或者 `element.get_attribute('textContent')`

使用 innerText 和 textContent 的区别是，前者只显示元素可见文本内容，后者显示所有内容（包括display属性为none的部分）

> [!NOTE]
>
> 如果了解web前端开发，可以知晓一下：
>
> get_attribute 调用本质上就是调用 HTMLElement 对像的属性
>
> 比如
>
> element.get_attribute('value') 等价于js里面的 element.value
>
> element.get_attribute('innerText') 等价于js里面的 element.innerText



##### 获取元素属性

`WebElement.get_attribute()`

通过WebElement对象的 `get_attribute` 方法来获取元素的属性值

比如要获取元素属性class的值，就可以使用 `element.get_attribute('class')`

```python
element = wd.find_element(By.ID, 'input_name')
print(element.get_attribute('class'))
```



##### 获取整个元素对应的HTML

要获取整个元素对应的HTML文本内容，可以使用 `element.get_attribute('outerHTML')`

如果，只是想获取某个元素 `内部` 的HTML文本内容，可以使用 `element.get_attribute('innerHTML')`



##### 获取输入框里面的文字

对于input输入框的元素，要获取里面的输入文本，用text属性是不行的，这时可以使用 `element.get_attribute('value')`

```python
element = wd.find_element(By.ID, "input1")
print(element.get_attribute('value')) # 获取输入框中的文本
```







### 四、frame 切换/窗口切换

#### 切换到frame

在html语法中，frame 元素 或者iframe元素的内部 会包含一个 **被嵌入的** 另一份html文档。

在我们使用selenium打开一个网页是， 我们的操作范围 缺省是当前的 html ， 并不包含被嵌入的html文档里面的内容。

如果我们要 操作 被嵌入的 html 文档 中的元素， 就必须 `切换操作范围` 到 被嵌入的文档中。

使用 WebDriver 对象的 switch_to 属性，像这样

```
wd.switch_to.frame(frame_reference)
```

其中， frame_reference 可以是 frame 元素的属性 name 或者 ID 。

比如这里，就可以填写 iframe元素的id 'frame1' 或者 name属性值 'innerFrame'。

像这样

```
wd.switch_to.frame('frame1')
```

或者

```
wd.switch_to.frame('innerFrame')
```

也可以填写frame 所对应的 WebElement 对象。

我们可以根据frame的元素位置或者属性特性，使用find系列的方法，选择到该元素，得到对应的WebElement对象

比如，这里就可以写

```
wd.switch_to.frame(wd.find_element(By.TAG_NAME, "iframe"))
```

然后，就可以进行后续操作frame里面的元素了。

即

```python
from selenium import webdriver
from selenium.webdriver.common.by import By

wd = webdriver.Chrome()

wd.get('https://cdn2.byhy.net/files/selenium/sample2.html')


# 先根据name属性值 'innerFrame'，切换到iframe中
wd.switch_to.frame('innerFrame')

# 根据 class name 选择元素，返回的是 一个列表
elements = wd.find_elements(By.CLASS_NAME, 'plant')

for element in elements:
    print(element.text)
```

如果我们已经切换到某个iframe里面进行操作了，那么后续选择和操作界面元素 就都是在这个frame里面进行的。

这时候，如果我们又需要操作 主html（我们把最外部的html称之为主html） 里面的元素了呢？

怎么切换回原来的主html呢？

很简单，写如下代码即可

```
wd.switch_to.default_content()
```

例如，在上面 代码 操作完 frame里面的元素后， 需要 点击 主html 里面的按钮，就可以这样写

```
from selenium import webdriver
from selenium.webdriver.common.by import By

wd = webdriver.Chrome()

wd.get('https://cdn2.byhy.net/files/selenium/sample2.html')


# 先根据name属性值 'innerFrame'，切换到iframe中
wd.switch_to.frame('innerFrame')

# 根据 class name 选择元素，返回的是 一个列表
elements = wd.find_elements(By.CLASS_NAME, 'plant')

for element in elements:
    print(element.text)

# 切换回 最外部的 HTML 中
wd.switch_to.default_content()

# 然后再 选择操作 外部的 HTML 中 的元素
wd.find_element_by_id('outerbutton').click()

wd.quit()
```



#### 切换到新的窗口

在网页上操作的时候，我们经常遇到，点击一个链接 或者 按钮，就会打开一个 `新窗口` 

如果我们用Selenium写自动化程序 **在新窗口里面 打开一个新网址**， 并且去自动化操作新窗口里面的元素，会有什么问题呢？

问题就在于，即使新窗口打开了， 这时候，我们的 WebDriver对象对应的 还是老窗口，自动化操作也还是在老窗口进行

如果我们要到新的窗口里面操作，该怎么做呢？

可以使用Webdriver对象的switch_to属性的 window方法，如下所示：

```
wd.switch_to.window(handle)
```

其中，参数handle需要传入什么呢？

WebDriver对象有window_handles 属性，这是一个列表对象， 里面包括了当前浏览器里面所有的窗口句柄。

所谓句柄，大家可以想象成对应网页窗口的一个ID，

那么我们就可以通过 类似下面的代码，

```
for handle in wd.window_handles:
    # 先切换到该窗口
    wd.switch_to.window(handle)
    # 得到该窗口的标题栏字符串，判断是不是我们要操作的那个窗口
    if 'Bing' in wd.title:
        # 如果是，那么这时候WebDriver对象就是对应的该该窗口，正好，跳出循环，
        break
```

上面代码的用意就是：

我们依次获取 wd.window_handles 里面的所有 句柄 对象， 并且调用 wd.switch_to.window(handle) 方法，切入到每个窗口，

然后检查里面该窗口对象的属性（可以是标题栏，地址栏），判断是不是我们要操作的那个窗口，如果是，就跳出循环。

------

同样的，如果我们在新窗口 操作结束后， 还要回到原来的窗口，该怎么办？

我们可以仍然使用上面的方法，依次切入窗口，然后根据 标题栏 之类的属性值判断。

还有更省事的方法。

因为我们一开始就在 原来的窗口里面，我们知道 进入新窗口操作完后，还要回来，可以事先 保存该老窗口的 句柄，使用如下方法

```
# mainWindow变量保存当前窗口的句柄
mainWindow = wd.current_window_handle
```

切换到新窗口操作完后，就可以直接像下面这样，将driver对应的对象返回到原来的窗口

```
#通过前面保存的老窗口的句柄，自己切换到老窗口
wd.switch_to.window(mainWindow)
```



### 五、选择框

常见的选择框包括： radio框、checkbox框、select框

即radio框是单选框，checkbox框是多选框，select框是下拉框。



#### radio框

radio框选择选项，直接用WebElement的click方法，模拟用户点击就可以了。

比如, 我们要在下面的html中：

```html
<div id="s_radio">
  <input type="radio" name="teacher" value="小江老师">小江老师<br>
  <input type="radio" name="teacher" value="小雷老师">小雷老师<br>
  <input type="radio" name="teacher" value="小凯老师" checked="checked">小凯老师
</div>
```

```python
# 获取当前选中的元素
element = wd.find_element(By.XPATH, 
  '//div[@id="s_radio"]//input[@name="teacher" and @checked="checked"]')
print('当前选中的是: ' + element.get_attribute('value'))

# 点选 小雷老师
wd.find_element(By.XPATH, 
  '//div[@id="s_radio"]//input[@value="小雷老师"]').click()
```



#### checkbox框

对checkbox进行选择，也是直接用 WebElement 的 click 方法，模拟用户点击选择。

需要注意的是，要选中checkbox的一个选项，必须 `先获取当前该复选框的状态` ，如果该选项已经勾选了，就不能再点击。否则反而会取消选择。

比如, 我们要在下面的html中：选中 小雷老师

```html
<div id="s_checkbox">
  <input type="checkbox" name="teacher" value="小江老师">小江老师<br>
  <input type="checkbox" name="teacher" value="小雷老师">小雷老师<br>
  <input type="checkbox" name="teacher" value="小凯老师" checked="checked">小凯老师
</div>
```

我们的思路可以是这样：

- 先把 已经选中的选项全部点击一下，确保都是未选状态
- 再点击 小雷老师

示例代码

```python
# 先把 已经选中的选项全部点击一下
elements = wd.find_elements(By.CSS_SELECTOR, 
  '//div[@id="s_radio"]//input[@name="teacher" and @checked="checked"]')

for element in elements:
    element.click()

# 再点击 小雷老师
wd.find_element(By.CSS_SELECTOR, 
  "//div[@id="s_radio"]//input[@value="小雷老师"]").click()
```



#### select框

radio框及checkbox框都是input元素，只是里面的type不同而已。

select框 则是一个新的select标签，对于Select 选择框， Selenium 专门提供了一个 `Select类` 进行操作。

```python
# 导入Select类
from selenium.webdriver.support.ui import Select

# 创建Select对象
select = Select(wd.find_element(By.ID, "xxx"))
```



- `select_by_value`

  根据选项`option` 的  `value` 属性值选择元素

  ```html
  <option value="foo">Bar</option>
  ```

  ```python
  select.select_by_value("foo")
  ```

- `select_by_index`

  根据选项的 `次序` （从0开始），选择元素

  ```python
  select.select_by_index(0) # 选择的是第一个选项
  ```

- `select_by_visible_text`

  根据选项的 `可见文本` ，选择元素。

  ```python
  select.select_by_visible_text('Bar')
  ```

- `deselect_by_value`

​	根据选项的value属性值， `去除` 选中元素

- `deselect_by_index`

​	根据选项的次序，`去除` 选中元素

- `deselect_by_visible_text`

  根据选项的可见文本，`去除` 选中元素

- `deselect_all`

​	`去除` 选中所有元素



##### Select单选框

对于 select单选框，操作比较简单：

不管原来选的是什么，直接用Select方法选择即可。

例如，选择示例里面的小雷老师，示例代码如下

```python
# 导入Select类
from selenium.webdriver.support.ui import Select

# 创建Select对象
select = Select(wd.find_element(By.ID, "ss_single"))

# 通过 Select 对象选中小雷老师
select.select_by_visible_text("小雷老师")
```

##### Select多选框

对于select多选框，要选中某几个选项，要注意去掉原来已经选中的选项。

例如，我们选择示例多选框中的 小雷老师 和 小凯老师

可以用select类 的deselect_all方法，清除所有 已经选中 的选项。

然后再通过 select_by_visible_text方法 选择 小雷老师 和 小凯老师。

示例代码如下：

```python
# 导入Select类
from selenium.webdriver.support.ui import Select

# 创建Select对象
select = Select(wd.find_element(By.ID, "ss_multi"))

# 清除所有 已经选中 的选项
select.deselect_all()

# 选择小雷老师 和 小凯老师
select.select_by_visible_text("小雷老师")
select.select_by_visible_text("小凯老师")
```





### 六、Xpath选择器



xpath 语法中，整个HTML文档根节点用'/'表示

| 表达式   | 描述                                                       |
| :------- | :--------------------------------------------------------- |
| nodename | 选取此节点的所有子节点。                                   |
| /        | 从根节点选取。                                             |
| //       | 从匹配选择的当前节点选择文档中的节点，而不考虑它们的位置。 |
| .        | 选取当前节点。                                             |
| ..       | 选取当前节点的父节点。                                     |
| @        | 选取属性。                                                 |



#### 运算符

| 运算符 | 描述           | 实例                      | 返回值                                                       |
| :----- | :------------- | :------------------------ | :----------------------------------------------------------- |
| \|     | 计算两个节点集 | //book \| //cd            | 返回所有拥有 book 和 cd 元素的节点集                         |
| +      | 加法           | 6 + 4                     | 10                                                           |
| -      | 减法           | 6 - 4                     | 2                                                            |
| *      | 乘法           | 6 * 4                     | 24                                                           |
| div    | 除法           | 8 div 4                   | 2                                                            |
| =      | 等于           | price=9.80                | 如果 price 是 9.80，则返回 true。如果 price 是 9.90，则返回 false。 |
| !=     | 不等于         | price!=9.80               | 如果 price 是 9.90，则返回 true。如果 price 是 9.80，则返回 false。 |
| <      | 小于           | price<9.80                | 如果 price 是 9.00，则返回 true。如果 price 是 9.90，则返回 false。 |
| <=     | 小于或等于     | price<=9.80               | 如果 price 是 9.00，则返回 true。如果 price 是 9.90，则返回 false。 |
| >      | 大于           | price>9.80                | 如果 price 是 9.90，则返回 true。如果 price 是 9.80，则返回 false。 |
| >=     | 大于或等于     | price>=9.80               | 如果 price 是 9.90，则返回 true。如果 price 是 9.70，则返回 false。 |
| or     | 或             | price=9.80 or price=9.70  | 如果 price 是 9.80，则返回 true。如果 price 是 9.50，则返回 false。 |
| and    | 与             | price>9.00 and price<9.90 | 如果 price 是 9.80，则返回 true。如果 price 是 8.50，则返回 false。 |
| mod    | 计算除法的余数 | 5 mod 2                   | 1                                                            |



逻辑表达式  and

```python
//标签名[@元素名称='元素值' and @元素名称='元素值']
//input[@id='kw' and @class='s_ipt']
```



逻辑表达式  or

```python
// 标签名[@元素名称='元素值' or @元素名称='元素值']
//input[@id='kw' or @class='s_t']
```









#### 绝对路径选择

从根节点开始的，到某个节点，每层都依次写下来，每层之间用 `/` 分隔的表达式，就是某元素的 `绝对路径`

例如： `/html/body/div` 就是一个绝对路径的xpath表达式，即每一层都是直接子节点的关系。

也就是说，body是html的儿子，而不是孙子等后代。

在selenium中使用：

```python
elements = wd.find_elements(By.XPATH, "/html/body/div")
```



#### 相对路径选择

xpath需要前面加 `//` , 表示从当前节点往下寻找所有的后代元素,不管它在什么位置。

例如： `//div//p` 表示选择 所有的 div 元素里面的 所有的 p 元素 ，不管div 在什么位置，也不管p元素在div下面的什么位置

```python
elements = wd.find_elements(By.XPATH, "//div//p")
```

例如：`//div/p` 表示选择 所有的 div 元素里面的 直接子节点 p 。



#### 通配符

如果要选择所有div节点的所有直接子节点，可以使用表达式 `//div/*`

`*` 是一个通配符，对应任意节点名的元素

```python
elements = driver.find_elements(By.XPATH, "//div/*")
for element in elements:
    print(element.get_attribute('outerHTML'))
```



#### 轴方式定位

轴 定义所选节点与当前节点之间的树关系

```python
轴表达式说明

parent::*  # 表示当前节点的父节点元素

ancestor::* # 表示当前节点的祖先节点元素

child::* # 表示当前节点的子元素

self::* # 表示当前节点的自身元素

ancestor-or-self::* # 表示当前节点的及它的祖先节点元素

descendant-or-self::* # 表示当前节点的及它们的后代元素

following-sibling::* # 表示当前节点的后序所有兄弟节点元素

preceding-sibling::* # 表示当前节点的前面所有兄弟节点元素

following::* # 表示当前节点的后序所有元素

preceding::* # 表示当前节点的所有元素
```



更多示例：

| 例子                   | 结果                                                         |
| :--------------------- | :----------------------------------------------------------- |
| child::book            | 选取所有属于当前节点的子元素的 book 节点。                   |
| attribute::lang        | 选取当前节点的 lang 属性。                                   |
| child::*               | 选取当前节点的所有子元素。                                   |
| attribute::*           | 选取当前节点的所有属性。                                     |
| child::text()          | 选取当前节点的所有文本子节点。                               |
| child::node()          | 选取当前节点的所有子节点。                                   |
| descendant::book       | 选取当前节点的所有 book 后代。                               |
| ancestor::book         | 选择当前节点的所有 book 先辈。                               |
| ancestor-or-self::book | 选取当前节点的所有 book 先辈以及当前节点（如果此节点是 book 节点） |
| child::*/child::price  | 选取当前节点的所有 price 孙节点。                            |





#### 根据属性选择

Xpath 可以根据属性来选择元素。

根据属性来选择元素 是通过 这种格式来的 `[@属性名='属性值']`

注意：

- 属性名注意前面有个@
- 属性值一定要用引号， 可以是单引号，也可以是双引号



##### 根据id属性选择

选择 id 为 west 的元素，可以这样 `//*[@id='west']`

这里的 * 表示任意标签，只要它里面的id属性是"west"就可以被选中。



又例如： `//p[@id='west']` ,即表示选择p标签且id属性为"west"的元素。



##### 根据class属性选择

同理，都是通过 `[@属性名='属性值']`来选择，不同的是，class属性可能不止一个，即

```html
<p id="beijing" class='capital huge-city'>
    北京    
</p>
```

这里的class属性有两个，`capital` 与 `huge-city` 。如果要选择它，对应的 xpath 就应该是 `//p[@class="capital huge-city"]`

不能只写一个属性，像这样 `//p[@class="capital"]` 则不行



对于其他属性，同样地按照 `[@属性名='属性值']` 格式选择即可。



##### 属性值包含字符串

要选择 style属性值 包含 color 字符串的 页面元素 ，可以这样 `//*[contains(@style,'color')]`

要选择 style属性值 以 color 字符串 `开头` 的 页面元素 ，可以这样 `//*[starts-with(@style,'color')]`

要选择 style属性值 以 某个 字符串 结尾 的 页面元素 ，大家可以推测是 `//*[ends-with(@style,'color')]`， 但是，很遗憾，这是xpath 2.0 的语法 ，目前浏览器都不支持



#### 按照次序选择



##### 某类型 第几个 子元素

要选择 p类型第2个的子元素，就是

```
//p[2]
```

注意，选择的是 `p类型第2个的子元素` ， 不是 `第2个子元素，并且是p类型` 。

注意体会区别

再比如，要选取父元素为div 中的 p类型 第2个 子元素

```
//div/p[2]
```



##### 第几个子元素

也可以选择第2个子元素，不管是什么类型，采用通配符

比如 选择父元素为div的第2个子元素，不管是什么类型

```
//div/*[2]
```



##### 某类型 倒数第几个 子元素

当然也可以选取倒数第几个子元素

比如：

- 选取p类型倒数第1个子元素

```
//p[last()]
```

- 选取p类型倒数第2个子元素

```
//p[last()-1]
```

- 选择父元素为div中p类型倒数第3个子元素

```
//div/p[last()-2]
```



##### 范围选择

xpath还可以选择子元素的次序范围。

比如，

- 选取option类型第1到2个子元素

```
//option[position()<=2]
```

或者

```
//option[position()<3]
```

- 选择class属性为multi_choice的前3个子元素

```
//*[@class='multi_choice']/*[position()<=3]
```

- 选择class属性为multi_choice的后3个子元素

```
//*[@class='multi_choice']/*[position()>=last()-2]
```

为什么不是 `last()-3` 呢？ 因为

`last()` 本身代表最后一个元素

`last()-1` 本身代表倒数第2个元素

`last()-2` 本身代表倒数第3个元素

- 选取 bookstore 元素的所有 book 元素，且其中的 price 元素的值须大于 35.00。

```
/bookstore/book[price>35.00]
```





#### 组选择、父节点、兄弟节点



##### 组选择

xpath 中用 竖线`|` 隔开多个表达式， 计算两个节点集。

例如： 要选所有的option元素 和所有的 h4 元素，可以使用

```
//option | //h4
```

选所有的 class 为 single_choice 和 class 为 multi_choice 的元素，可以使用

```
 //*[@class='single_choice'] | //*[@class='multi_choice']
```



#####  选择父节点

某个元素的父节点用 `/..` 表示

比如，要选择 id 为 china 的节点的父节点，可以这样写 `//*[@id='china']/..` 。

当某个元素没有特征可以直接选择，但是它有子节点有特征， 就可以采用这种方法，先选择子节点，再指定父节点。

还可以继续找上层父节点，比如 `//*[@id='china']/../../..`



##### 选择兄弟节点

xpath可以选择 后续 兄弟节点，用这样的语法 `following-sibling::`

比如，要选择 class 为 single_choice 的元素的所有后续兄弟节点 `//*[@class='single_choice']/following-sibling::*`

如果，要选择后续节点中的div节点， 就应该这样写 `//*[@class='single_choice']/following-sibling::div`

xpath还可以选择 `前面的` 兄弟节点，用这样的语法 `preceding-sibling::`

比如，要选择 class 为 single_choice 的元素的 `所有` 前面的兄弟节点，这样写

```
//*[@class='single_choice']/preceding-sibling::*
```

要选择 class 为 single_choice 的元素的

前面最靠近的兄弟节点 , 这样写

```
//*[@class='single_choice']/preceding-sibling::*[1]
```

前面第2靠近的兄弟节点 , 这样写

```
//*[@class='single_choice']/preceding-sibling::*[2]
```



> [!NOTE]
>
> 要在某个元素内部使用xpath选择元素， 需要 `在xpath表达式最前面加个点`
>
> 例如：想在WebElement对象中，而不是WebDriver中，使用find_elements(By.XPATH,"//p") 即本意是想在WebElement对象中选择里面的p元素。
>
> ```python
> # 先寻找id是china的元素
> china = wd.find_element(By.ID, 'china')
> 
> # 再选择该元素内部的p元素
> elements = china.find_elements(By.XPATH, '//p')
> 
> # 打印结果
> for element in elements:
>     print('----------------')
>     print(element.get_attribute('outerHTML'))
> ```
>
> 但运行的结果却显示，打印的不仅仅是china内部的p元素，而是所有的p元素。
>
> 要在某个元素内部使用xpath选择元素， 需要 `在xpath表达式最前面加个点` 。
>
> 像这样
>
> ```
> elements = china.find_elements(By.XPATH, './/p')
> ```





