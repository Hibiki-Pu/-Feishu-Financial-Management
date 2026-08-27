"""衡远财务：基于 Excel 实际口径的 FastAPI + pyecharts 图表服务。"""
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pyecharts import options as opts
from pyecharts.charts import Bar, Line, Page, Pie
from pyecharts.components import Table

app = FastAPI(title="衡远财务图表服务", version="0.2.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000", "http://localhost:3001"], allow_methods=["GET"], allow_headers=["*"])

MONTHS = [f"{i}月" for i in range(1, 13)]
DATA = {
    "全公司": {"headcount": 48, "labor": 22293822, "rd": 3256200, "budget": 29637000, "monthly_labor": [1831821,1831821,1948206,1858221,1831821,1831821,1831821,1858221,1948206,1831821,1858221,1831821], "monthly_rd": [189437,204330,219224,234117,249010,263903,278797,293690,308583,323476,338370,353263]},
    "财政部": {"headcount": 8, "labor": 3601378, "rd": 450832, "budget": 4922000, "monthly_labor": [297005,297005,315664,297005,297005,297005,297005,297005,315664,297005,297005,297005], "monthly_rd": [29378,30867,32357,33846,35335,36825,38314,39803,41293,42782,44271,45761]},
    "人事部": {"headcount": 8, "labor": 3494470, "rd": 0, "budget": 4624000, "monthly_labor": [288199,288199,306240,288199,288199,288199,288199,288199,306240,288199,288199,288199], "monthly_rd": [0] * 12},
    "研发部": {"headcount": 16, "labor": 7612720, "rd": 1619819, "budget": 10303000, "monthly_labor": [627703,627703,667845,627703,627703,627703,627703,627703,667845,627703,627703,627703], "monthly_rd": [85837,94773,103709,112645,121581,130517,139453,148389,157325,166260,175197,184133]},
    "开发部": {"headcount": 16, "labor": 7585254, "rd": 1185549, "budget": 9788000, "monthly_labor": [618914,618914,658457,645314,618914,618914,618914,645314,658457,618914,645314,618914], "monthly_rd": [74222,78690,83158,87626,92094,96561,101030,105498,109965,114434,118902,123369]},
}
PROJECTS = [("智算平台A",665152),("飞书财务试验E",655878),("移动协同B",651240),("安全引擎D",646602),("数据中台C",637328)]

@app.get("/health")
def health():
    return {"status": "ok", "data_period": "2026"}

@app.get("/api/finance/summary")
def finance_summary(department: str = Query("全公司")):
    data = DATA.get(department, DATA["全公司"])
    return {**data, "months": MONTHS, "execution_rate": round((data["labor"] + data["rd"]) / data["budget"], 4)}

@app.get("/charts/dashboard", response_class=HTMLResponse)
def charts_dashboard(department: str = Query("全公司")):
    data = DATA.get(department, DATA["全公司"])
    bar = (Bar(init_opts=opts.InitOpts(width="100%", height="360px"))
        .add_xaxis(MONTHS)
        .add_yaxis("人工成本（元）", data["monthly_labor"], color="#3370ff")
        .add_yaxis("研发投入（元）", data["monthly_rd"], color="#f3a552")
        .set_global_opts(title_opts=opts.TitleOpts(title=f"{department}月度成本趋势"), tooltip_opts=opts.TooltipOpts(trigger="axis"), datazoom_opts=[opts.DataZoomOpts()]))
    project_bar = (Bar(init_opts=opts.InitOpts(width="100%", height="330px"))
        .add_xaxis([name for name, _ in PROJECTS]).add_yaxis("投入金额（元）", [amount for _, amount in PROJECTS], color="#28a875")
        .set_global_opts(title_opts=opts.TitleOpts(title="2026 年研发项目投入排行"), xaxis_opts=opts.AxisOpts(axislabel_opts=opts.LabelOpts(rotate=18))))
    rate = round((data["labor"] + data["rd"]) / data["budget"] * 100, 1)
    pie = (Pie(init_opts=opts.InitOpts(width="100%", height="320px")).add("预算", [("已执行", data["labor"] + data["rd"]), ("剩余额度", max(data["budget"] - data["labor"] - data["rd"], 0))], radius=["45%", "70%"]).set_global_opts(title_opts=opts.TitleOpts(title=f"预算执行率 {rate}%")))
    table = Table().add(["指标", "金额/人数"], [["在职人数", data["headcount"]], ["人工成本", data["labor"]], ["研发投入", data["rd"]], ["年度预算", data["budget"]]])
    return Page(page_title="衡远成本与研发驾驶舱").add(bar, project_bar, pie, table).render_embed()
