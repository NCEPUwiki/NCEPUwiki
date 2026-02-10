---
home: true
# heroImage: /img/logo.svg
heroText: NCEPUwiki
tagline: 华北电力大学wiki
bannerBg: none # auto => 网格纹背景(有bodyBgImg时无背景)，默认 | none => 无 | '大图地址' | background: 自定义背景样式       提示：如发现文本颜色不适应你的背景时可以到palette.styl修改$bannerTextColor变量

# 文章列表显示方式: detailed 默认，显示详细版文章列表（包括作者、分类、标签、摘要、分页等）| simple => 显示简约版文章列表（仅标题和日期）| none 不显示文章列表
postList: simple
simplePostListLength: 5
---

<style>


/* === 感谢贡献者横幅 === */
.thanks-banner {
  margin: 3rem auto 0;
  max-width: 980px;
  padding: 2rem 1.5rem;
  border-radius: 16px;
  text-align: center;
  background: linear-gradient(135deg, #fff7e6 0%, #fff0f6 50%, #e6f7ff 100%);
  box-shadow: 0 8px 28px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.06);
  position: relative;
  overflow: hidden;
}

.thanks-banner h2 {
  font-size: 1.8rem;
  margin: 0 0 0.5rem 0;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.thanks-banner p {
  margin: 0.25rem 0 1rem 0;
  font-size: 1.05rem;
  line-height: 1.8;
}

.thanks-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 0.75rem;
}

.thanks-actions a {
  display: inline-block;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  border: 1px solid rgba(0,0,0,0.1);
  transition: transform .2s ease, box-shadow .2s ease, background-color .2s ease;
}

.thanks-actions a.primary {
  background: #111827;
  color: #fff;
  border-color: #111827;
}

.thanks-actions a.secondary {
  background: #ffffff;
  color: #111827;
}

.thanks-actions a:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.10);
}

.thanks-banner::after {
  content: "⭐";
  position: absolute;
  right: -12px;
  top: -12px;
  font-size: 64px;
  opacity: 0.10;
  transform: rotate(15deg);
}
</style>

::: cardList 3
```yaml
config:
    target: _self
    imgHeight: auto
    objectFit: cover
    lineClamp: 1
data:
    - name: 新生入学
      desc: 入学指南
      link: /categories/?category=新生 # 可选
      bgColor: '#CBEAFA' # 可选，默认var(--bodyBg)。颜色值有#号时请添加单引号
      textColor: '#6854A1' # 可选，默认var(--textColor)

    - name: 学习专题
      desc: 学分、选课、转专业、专业评价
      link: /categories/?category=学习专题 # 可选
      bgColor: '#CBEAFA' # 可选，默认var(--bodyBg)。颜色值有#号时请添加单引号
      textColor: '#6854A1' # 可选，默认var(--textColor)

    - name: 学习资料
      desc: 学习资料
      link: /categories/?category=学习资料 # 可选
      bgColor: '#CBEAFA' # 可选，默认var(--bodyBg)。颜色值有#号时请添加单引号
      textColor: '#6854A1' # 可选，默认var(--textColor)

    - name: 群汇总
      desc: 老乡群与同好群
      link: /categories/?category=群汇总 # 可选
      bgColor: '#CBEAFA' # 可选，默认var(--bodyBg)。颜色值有#号时请添加单引号
      textColor: '#6854A1' # 可选，默认var(--textColor)

    - name: 校园生活
      desc: 常用信息、社团、电动车上牌
      link: /categories/?category=校园生活 # 可选
      bgColor: '#CBEAFA' # 可选，默认var(--bodyBg)。颜色值有#号时请添加单引号
      textColor: '#6854A1' # 可选，默认var(--textColor)

    - name: 就业
      desc: 求职知识、内推码
      link: /categories/?category=就业 # 可选
      bgColor: '#CBEAFA' # 可选，默认var(--bodyBg)。颜色值有#号时请添加单引号
      textColor: '#6854A1' # 可选，默认var(--textColor)

    - name: 贡献
      desc: 和我们一起建设Wiki
      link: /categories/?category=贡献 # 可选
      bgColor: '#CBEAFA' # 可选，默认var(--bodyBg)。颜色值有#号时请添加单引号
      textColor: '#6854A1' # 可选，默认var(--textColor)

```
:::

::: cardList 2
```yaml
- name: Galgame同好会-保定
  desc: 278072633
  avatar: /img/Galgame同好会-保定群头像.png # 可选
  link: /img/Galgame同好会-保定群二维码.jpg # 可选
  bgColor: '#CBEAFA' # 可选，默认var(--bodyBg)。颜色值有#号时请添加单引号
  textColor: '#6854A1' # 可选，默认var(--textColor)

- name: Galgame同好会-北京
  desc: 927042578
  avatar: /img/Galgame同好会-北京群头像.png # 可选
  link: /img/Galgame同好会-北京群二维码.jpg # 可选
  bgColor: '#CBEAFA' # 可选，默认var(--bodyBg)。颜色值有#号时请添加单引号
  textColor: '#6854A1' # 可选，默认var(--textColor)

```
:::

## 欢迎访问 NCEPUwiki

NCEPUwiki是由华北电力大学学生共同维护的**非官方**校园知识库，旨在提供：

- 高质量、结构化的信息资源  
- 实用的升学/学习经验分享
- 持续更新的学习资料

网站现在可以通过二维码扫描访问：

![二维码](/img/网站二维码.png)

## 活动

有活动可以在**反馈与共建**中联系我们宣传

## 反馈与共建

长期更新计划：

- 各专业[学习资料](/categories/?category=学习资料)，提供请注明校区、院系、专业、课程名。
- 各个课程的[评价](/pages/CourseEvaluation)，问卷<https://www.wjx.cn/vm/myKSytv.aspx#>
- [内推码](/pages/EmployeeRefer/)

更新计划：

- 医保说明与教程
- 计算机知识包括python，vs2010卸载
- 保研
- 竞赛

如果你发现内容需要补充、修正，欢迎通过以下方式参与共建：

- 提交 [Issue](https://github.com/NCEPUwiki/NCEPUwiki/issues) 或者 [pull request](https://github.com/NCEPUwiki/NCEPUwiki/pulls)
- 加入交流QQ群 417695180
- 或发邮件至 `1361942776@qq.com`

<div class="thanks-banner">
  <h2>🎉 感谢所有贡献者的无私贡献！</h2>
  <p>每一行文字、每一次修订、每一个 PR / Issue，都是 NCEPUwiki 成长的力量。<br/>因为你们，这里才更完整、更可靠、更温暖。</p>
  <div class="thanks-actions">
    <a class="primary" href="https://github.com/NCEPUwiki/NCEPUwiki/graphs/contributors" target="_blank" rel="noopener">查看贡献者</a>
    <a class="secondary" href="https://github.com/NCEPUwiki/NCEPUwiki/pulls" target="_blank" rel="noopener">参与贡献</a>
    <a class="secondary" href="https://github.com/NCEPUwiki/NCEPUwiki/stargazers" target="_blank" rel="noopener">为项目加星</a>
  </div>
</div>

::: cardList 3
```yaml
- name: 落点华电有趣青年
  desc: 华电最全 生活指南 | 资讯吐槽 | 校园故事 非官方自媒体
  avatar: /img/落点华电.jpg # 可选
  link: /img/落点二维码.jpg # 可选
  bgColor: '#CBEAFA' # 可选，默认var(--bodyBg)。颜色值有#号时请添加单引号
  textColor: '#6854A1' # 可选，默认var(--textColor)

- name: 保定表白墙微信
  desc: 非官方的华电校园自媒体平台，为华电学子服务
  avatar: /img/保定表白墙微信头像.jpg # 可选
  link: /img/保定表白墙微信.jpg # 可选
  bgColor: '#CBEAFA' # 可选，默认var(--bodyBg)。颜色值有#号时请添加单引号
  textColor: '#6854A1' # 可选，默认var(--textColor)

- name: 保定表白墙QQ
  desc: 学长学姐2018创立至今，二手/树洞/拼车/答疑，为爱情服务
  avatar: /img/保定表白墙QQ头像.jpg # 可选
  link: /img/保定表白墙QQ.jpg # 可选
  bgColor: '#CBEAFA' # 可选，默认var(--bodyBg)。颜色值有#号时请添加单引号
  textColor: '#6854A1' # 可选，默认var(--textColor)

```
:::