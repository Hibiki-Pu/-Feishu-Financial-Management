"use client";

import { useMemo, useState } from "react";

type Department = "全公司" | "财政部" | "人事部" | "研发部" | "开发部";

const finance: Record<Department, { headcount:number; labor:number; priorLabor:number; rd:number; priorRd:number; budget:number; monthlyLabor:number[]; monthlyRd:number[] }> = {
  全公司: { headcount:48, labor:22293822, priorLabor:21517676, rd:3256200, priorRd:3015000, budget:29637000, monthlyLabor:[1831821,1831821,1948206,1858221,1831821,1831821,1831821,1858221,1948206,1831821,1858221,1831821], monthlyRd:[189437,204330,219224,234117,249010,263903,278797,293690,308583,323476,338370,353263] },
  财政部: { headcount:8, labor:3601378, priorLabor:3475604, rd:450832, priorRd:417438, budget:4922000, monthlyLabor:[297005,297005,315664,297005,297005,297005,297005,297005,315664,297005,297005,297005], monthlyRd:[29378,30867,32357,33846,35335,36825,38314,39803,41293,42782,44271,45761] },
  人事部: { headcount:8, labor:3494470, priorLabor:3372640, rd:0, priorRd:0, budget:4624000, monthlyLabor:[288199,288199,306240,288199,288199,288199,288199,288199,306240,288199,288199,288199], monthlyRd:[0,0,0,0,0,0,0,0,0,0,0,0] },
  研发部: { headcount:16, labor:7612720, priorLabor:7346482, rd:1619819, priorRd:1499832, budget:10303000, monthlyLabor:[627703,627703,667845,627703,627703,627703,627703,627703,667845,627703,627703,627703], monthlyRd:[85837,94773,103709,112645,121581,130517,139453,148389,157325,166260,175197,184133] },
  开发部: { headcount:16, labor:7585254, priorLabor:7322950, rd:1185549, priorRd:1097730, budget:9788000, monthlyLabor:[618914,618914,658457,645314,618914,618914,618914,645314,658457,618914,645314,618914], monthlyRd:[74222,78690,83158,87626,92094,96561,101030,105498,109965,114434,118902,123369] },
};

const rows = [
  { id:"R20260240", date:"2026-12-20", dept:"财政部", subject:"外部测试", project:"移动协同B", vendor:"新域软件", amount:45761, owner:"郑航", invoice:"已验票", payment:"已支付" },
  { id:"R20260239", date:"2026-12-18", dept:"开发部", subject:"软件许可", project:"智算平台A", vendor:"博思咨询", amount:43442, owner:"李颖", invoice:"已验票", payment:"待支付" },
  { id:"R20260238", date:"2026-12-16", dept:"开发部", subject:"差旅调研", project:"飞书财务试验E", vendor:"启明测试实验室", amount:41123, owner:"赵凯", invoice:"待补票", payment:"已支付" },
  { id:"R20260237", date:"2026-12-14", dept:"开发部", subject:"专利申请", project:"安全引擎D", vendor:"远景数据服务", amount:38804, owner:"秦彤", invoice:"已验票", payment:"已支付" },
  { id:"R20260236", date:"2026-12-12", dept:"研发部", subject:"技术咨询", project:"数据中台C", vendor:"星河云科技", amount:36486, owner:"郑泽", invoice:"已验票", payment:"已支付" },
  { id:"R20260235", date:"2026-12-10", dept:"研发部", subject:"设备采购", project:"移动协同B", vendor:"新域软件", amount:34167, owner:"李宁", invoice:"已验票", payment:"已支付" },
  { id:"R20260234", date:"2026-12-08", dept:"研发部", subject:"云服务费", project:"智算平台A", vendor:"博思咨询", amount:31848, owner:"赵诚", invoice:"已验票", payment:"已支付" },
  { id:"R20260233", date:"2026-12-06", dept:"研发部", subject:"样机材料", project:"飞书财务试验E", vendor:"启明测试实验室", amount:29529, owner:"秦妍", invoice:"已验票", payment:"已支付" },
  { id:"R20260232", date:"2026-12-04", dept:"研发部", subject:"数据采购", project:"安全引擎D", vendor:"远景数据服务", amount:27211, owner:"韩昕", invoice:"已验票", payment:"已支付" },
  { id:"R20260231", date:"2026-12-02", dept:"研发部", subject:"外部测试", project:"数据中台C", vendor:"星河云科技", amount:24892, owner:"卫颖", invoice:"待补票", payment:"待支付" },
];

const projects = [
  { name:"智算平台A", amount:665152 },
  { name:"飞书财务试验E", amount:655878 },
  { name:"移动协同B", amount:651240 },
  { name:"安全引擎D", amount:646602 },
  { name:"数据中台C", amount:637328 },
];

const docs = [
  { icon:"报", title:"2026 年度财务预算方案", desc:"年度预算 · 财务中心", time:"今天 09:32", color:"blue" },
  { icon:"表", title:"8 月部门费用明细", desc:"月度报表 · 全体部门", time:"昨天 17:48", color:"green" },
  { icon:"制", title:"费用报销与审批制度 V3.2", desc:"制度文档 · 行政财务", time:"8月18日", color:"orange" },
  { icon:"审", title:"Q3 内部财务审计记录", desc:"审计资料 · 仅管理员", time:"8月15日", color:"violet" },
];

const money = (value:number) => `¥ ${value.toLocaleString("zh-CN")}`;

export default function Home() {
  const [department, setDepartment] = useState<Department>("全公司");
  const [query, setQuery] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [entryMode, setEntryMode] = useState<"single" | "batch">("single");
  const [addedRows, setAddedRows] = useState<typeof rows>([]);
  const [toast, setToast] = useState("");
  const data = finance[department];
  const rate = Math.round(((data.labor + data.rd) / data.budget) * 1000) / 10;
  const laborChange = ((data.labor / data.priorLabor - 1) * 100).toFixed(1);
  const rdChange = data.priorRd ? ((data.rd / data.priorRd - 1) * 100).toFixed(1) : "0.0";
  const filteredRows = useMemo(() => [...addedRows, ...rows].filter(row =>
    (department === "全公司" || row.dept === department) && Object.values(row).join(" ").includes(query)
  ), [addedRows, department, query]);

  function notify(message:string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function addExpense(formData: FormData) {
    const amount = Number(formData.get("amount"));
    if (!Number.isFinite(amount) || amount <= 0) {
      notify("请输入大于 0 的金额");
      return;
    }
    const stamp = Date.now().toString().slice(-6);
    setAddedRows(current => [{
      id: `NEW${stamp}`,
      date: String(formData.get("date")),
      dept: String(formData.get("dept")),
      subject: String(formData.get("category")),
      project: String(formData.get("project")),
      vendor: String(formData.get("vendor")),
      amount,
      owner: String(formData.get("owner")),
      invoice: String(formData.get("invoice")),
      payment: String(formData.get("payment")),
    }, ...current]);
    setImportOpen(false);
    notify("费用记录已保存，并加入明细列表");
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">衡</span><span>衡远财务</span></div>
        <nav aria-label="主导航">
          <p className="nav-label">工作台</p>
          <a className="nav-item active" href="#overview"><span>▦</span>成本总览</a>
          <a className="nav-item" href="#departments"><span>◫</span>部门分析</a>
          <a className="nav-item" href="#records"><span>≡</span>研发费用</a>
          <p className="nav-label">协同管理</p>
          <a className="nav-item" href="#docs"><span>□</span>文档中心</a>
          <a className="nav-item" href="#reports"><span>↗</span>报表导出</a>
        </nav>
        <div className="security-note"><b>✓ 数据安全保护中</b><span>权限与操作全程留痕</span></div>
        <div className="sidebar-user"><div className="avatar">林</div><div><strong>林晓岚</strong><small>财务管理员</small></div><button aria-label="更多">•••</button></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div><p className="eyebrow">企业成本与研发驾驶舱</p><h1>成本管理总览</h1></div>
          <div className="top-actions"><button className="icon-button" aria-label="通知">◌<i /></button><button className="primary-button" onClick={() => {setEntryMode("single");setImportOpen(true);}}>＋ 录入数据</button></div>
        </header>

        <div className="content" id="overview">
          <div className="welcome-row">
            <div><h2>2026 年成本与研发概况</h2><p>数据来源：员工主数据、月度工资、研发费用与部门预算</p></div>
            <div className="filters"><button>2026 年</button><select aria-label="选择部门" value={department} onChange={(e) => setDepartment(e.target.value as Department)}>{Object.keys(finance).map(name => <option key={name}>{name}</option>)}</select></div>
          </div>

          <section className="summary-grid" aria-label="财务核心指标">
            {[
              ["年度人工成本", money(data.labor), `+${laborChange}%`, "blue"],
              ["年度研发投入", money(data.rd), data.priorRd ? `+${rdChange}%` : "无发生额", "orange"],
              ["年末在职人数", `${data.headcount} 人`, "人员稳定", "green"],
              ["预算执行率", `${rate}%`, rate > 90 ? "需要关注" : "预算可控", "violet"],
            ].map(([label,value,change,tone]) => (
              <article className={`summary-card ${tone}`} key={label}>
                <div className="card-top"><span>{label}</span><b>•••</b></div><strong>{value}</strong><p><em>{change}</em><span>{label === "预算执行率" ? "年度预算" : label === "年末在职人数" ? "当前口径" : "较 2025 年"}</span></p>
              </article>
            ))}
          </section>

          <section className="dashboard-grid" id="departments">
            <article className="panel trend-panel">
              <div className="panel-heading"><div><h3>月度成本趋势</h3><p>{department} 2026 年人工成本与研发投入</p></div><div className="legend"><span className="income-dot">人工成本</span><span className="expense-dot">研发投入</span></div></div>
              <div className="chart-placeholder"><div className="y-labels"><span>高</span><span>80%</span><span>60%</span><span>40%</span><span>20%</span><span>0</span></div><div className="chart-stage"><div className="grid-lines" /><div className="bars">{data.monthlyLabor.flatMap((height, i) => [<i key={`${i}a`} title={`${i+1}月人工成本 ${money(height)}`} style={{height:`${Math.max(4,height/22000)}%`}} className="income-bar" />,<i key={`${i}b`} title={`${i+1}月研发投入 ${money(data.monthlyRd[i])}`} style={{height:`${Math.max(1,data.monthlyRd[i]/4200)}%`}} className="expense-bar" />])}</div><div className="x-labels">{[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <span key={m}>{m}月</span>)}</div></div></div>
            </article>

            <article className="panel budget-panel">
              <div className="panel-heading"><div><h3>年度预算</h3><p>{department}预算使用进度</p></div><button className="text-button" onClick={() => notify("已打开预算分析视图")}>查看详情 →</button></div>
              <div className="budget-ring" style={{background:`conic-gradient(#3370ff 0 ${Math.min(rate,100)}%,#edf1f7 ${Math.min(rate,100)}%)`}}><div><strong>{rate}%</strong><span>月度执行</span></div></div>
              <div className="budget-values"><div><span>年度总预算</span><strong>{money(data.budget)}</strong></div><div><span>年度剩余额度</span><strong>{money(Math.max(data.budget-data.labor-data.rd,0))}</strong></div></div>
            </article>
          </section>

          <section className="insights-grid">
            <article className="panel project-panel">
              <div className="panel-heading"><div><h3>研发项目投入排行</h3><p>2026 年项目累计费用</p></div><span className="data-tag">Excel 实际数据</span></div>
              <div className="project-list">{projects.map((project, index) => <div className="project-row" key={project.name}><span className="rank">{index + 1}</span><div><strong>{project.name}</strong><i><b style={{width:`${project.amount / projects[0].amount * 100}%`}} /></i></div><em>{money(project.amount)}</em></div>)}</div>
            </article>
            <article className="panel alert-panel">
              <div className="panel-heading"><div><h3>待处理事项</h3><p>2026 年研发费用异常提醒</p></div></div>
              <button onClick={() => {setQuery("待支付");document.querySelector("#records")?.scrollIntoView({behavior:"smooth"});}}><span className="alert-icon orange">付</span><span><strong>24 笔待支付</strong><small>需核对付款计划与合同</small></span><b>→</b></button>
              <button onClick={() => {setQuery("待补票");document.querySelector("#records")?.scrollIntoView({behavior:"smooth"});}}><span className="alert-icon violet">票</span><span><strong>24 笔待补票</strong><small>需补充发票并完成验票</small></span><b>→</b></button>
              <div className="quality-ok"><span>✓</span><div><strong>数据质量检查通过</strong><small>员工、工资、预算及汇总数据均已对平</small></div></div>
            </article>
          </section>

          <section className="panel records-panel" id="records">
            <div className="panel-heading records-heading"><div><h3>研发费用明细</h3><p>展示最新费用记录、供应商、发票与付款状态</p></div><div className="table-actions"><input aria-label="搜索研发费用" placeholder="搜索项目、供应商或状态" value={query} onChange={e => setQuery(e.target.value)} /><button onClick={() => notify("研发费用报表已生成")}>导出报表</button></div></div>
            <div className="table-wrap"><table><thead><tr><th>日期 / 编号</th><th>部门</th><th>费用 / 项目</th><th>供应商</th><th>金额</th><th>经办人</th><th>发票</th><th>付款</th></tr></thead><tbody>{filteredRows.map(row => <tr key={row.id}><td><strong>{row.date}</strong><small>{row.id}</small></td><td>{row.dept}</td><td><strong>{row.subject}</strong><small>{row.project}</small></td><td>{row.vendor}</td><td className="amount">{money(row.amount)}</td><td>{row.owner}</td><td><span className={`status ${row.invoice === "待补票" ? "pending" : ""}`}>● {row.invoice}</span></td><td><span className={`status ${row.payment === "待支付" ? "pending" : ""}`}>● {row.payment}</span></td></tr>)}</tbody></table>{filteredRows.length === 0 && <div className="empty">当前筛选条件下暂无记录</div>}</div>
          </section>

          <section className="docs-section" id="docs">
            <div className="section-title"><div><h3>财务文档中心</h3><p>关联飞书云文档，统一管理制度、预算和审计资料</p></div><button onClick={() => notify("新建文档流程已准备")}>＋ 新建文档</button></div>
            <div className="docs-grid">{docs.map(doc => <button className="doc-card" key={doc.title} onClick={() => notify(`正在打开：${doc.title}`)}><span className={`doc-icon ${doc.color}`}>{doc.icon}</span><span className="doc-info"><strong>{doc.title}</strong><small>{doc.desc}</small></span><time>{doc.time}</time></button>)}</div>
          </section>

          <section className="report-banner" id="reports"><div><span className="report-icon">↗</span><div><h3>2026 年成本管理报告已生成</h3><p>已汇总 48 名员工、1,152 条工资记录和 240 条研发费用记录。</p></div></div><button onClick={() => notify("2026 年成本报告已加入下载队列")}>下载报告</button></section>
        </div>
      </section>

      {importOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setImportOpen(false)}><section className="modal entry-modal" role="dialog" aria-modal="true" aria-label="录入财务数据" onMouseDown={e => e.stopPropagation()}><button className="modal-close" onClick={() => setImportOpen(false)} aria-label="关闭">×</button><h2>录入财务数据</h2><p>单笔费用可直接填写，大批量数据可通过标准模板导入。</p><div className="entry-tabs" role="tablist"><button role="tab" aria-selected={entryMode === "single"} className={entryMode === "single" ? "active" : ""} onClick={() => setEntryMode("single")}>单笔录入</button><button role="tab" aria-selected={entryMode === "batch"} className={entryMode === "batch" ? "active" : ""} onClick={() => setEntryMode("batch")}>批量导入</button></div>{entryMode === "single" ? <form action={addExpense} className="entry-form"><label>发生日期<input name="date" type="date" defaultValue="2026-12-24" required /></label><label>所属部门<select name="dept" defaultValue={department === "全公司" ? "研发部" : department}>{Object.keys(finance).filter(name => name !== "全公司").map(name => <option key={name}>{name}</option>)}</select></label><label>研发项目<select name="project">{projects.map(project => <option key={project.name}>{project.name}</option>)}</select></label><label>费用类别<select name="category"><option>云服务费</option><option>软件许可</option><option>设备采购</option><option>技术咨询</option><option>外部测试</option><option>差旅调研</option></select></label><label className="wide">供应商 / 收款方<input name="vendor" placeholder="请输入供应商名称" required /></label><label>金额（元）<input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required /></label><label>经办人<input name="owner" placeholder="请输入经办人" required /></label><label>发票状态<select name="invoice"><option>待补票</option><option>已验票</option></select></label><label>付款状态<select name="payment"><option>待支付</option><option>已支付</option></select></label><div className="form-actions wide"><button type="button" onClick={() => setImportOpen(false)}>取消</button><button className="primary-button" type="submit">保存记录</button></div></form> : <div className="batch-pane"><span className="upload-mark">⇧</span><label className="dropzone"><input type="file" accept=".xlsx,.xls,.csv" onChange={() => {setImportOpen(false);notify("文件已接收：正确数据将预览，错误行会单独提示");}} /><strong>点击选择 Excel 或 CSV</strong><span>上传后先校验和预览，不会立即写入数据</span></label><a href="data:text/plain;charset=utf-8,%E8%B4%B9%E7%94%A8%E7%BC%96%E5%8F%B7%2C%E5%8F%91%E7%94%9F%E6%97%A5%E6%9C%9F%2C%E9%83%A8%E9%97%A8%2C%E7%A0%94%E5%8F%91%E9%A1%B9%E7%9B%AE%2C%E8%B4%B9%E7%94%A8%E7%B1%BB%E5%88%AB%2C%E4%BE%9B%E5%BA%94%E5%95%86%2C%E9%87%91%E9%A2%9D%2C%E7%BB%8F%E5%8A%9E%E4%BA%BA%2C%E5%8F%91%E7%A5%A8%E7%8A%B6%E6%80%81%2C%E4%BB%98%E6%AC%BE%E7%8A%B6%E6%80%81" download="研发费用导入模板.csv">下载标准导入模板</a><div className="batch-tip"><strong>导入流程</strong><span>上传文件 → 字段校验 → 错误提示 → 数据预览 → 确认入库</span></div></div>}</section></div>}
      {toast && <div className="toast">✓ {toast}</div>}
    </main>
  );
}
