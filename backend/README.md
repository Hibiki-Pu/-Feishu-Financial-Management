# pyecharts 图表服务

安装并启动：

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

访问 `http://127.0.0.1:8000/charts/dashboard?department=全公司` 查看图表页面。

生产接入时应将示例 `DATA` 替换为财务数据库查询，并在每个接口中依据飞书用户身份校验部门权限。
