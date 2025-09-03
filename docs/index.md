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
.feature-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  padding: 1rem 0;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 160px;
  text-align: center;
  padding: 1.2rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-decoration: none;
  color: inherit;
}

.feature-item:hover {
  transform: translateY(-5px) scale(1.03);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  background-color: #ffffff;
}

.feature-item img {
  width: 48px;
  height: 48px;
  margin-bottom: 0.8rem;
  pointer-events: none;
}

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

<div class="feature-grid">
  <a class="feature-item" href="https://wiki.ncepuinfo.cc/categories/?category=%E6%96%B0%E7%94%9F">
    <img src="/img/school.svg" alt="入学指南">
    <div>入学指南</div>
  </a>
  <a class="feature-item" href="https://wiki.ncepuinfo.cc/categories/?category=%E7%BE%A4%E6%B1%87%E6%80%BB">
    <img src="/img/group.svg" alt="群汇总">
    <div>群汇总</div>
  </a>
  <a class="feature-item" href="https://wiki.ncepuinfo.cc/categories/?category=%E8%AF%BE%E7%A8%8B%E6%95%99%E6%9D%90%E4%B8%8E%E8%B5%84%E6%96%99">
    <img src="/img/book.png" alt="课程教材与资料">
    <div>教材资料</div>
  </a>
</div>



## 欢迎访问 NCEPUwiki

NCEPUwiki是由华北电力大学学生共同维护的**非官方**校园知识库，旨在提供：

- 高质量、结构化的信息资源  
- 实用的升学/学习经验分享
- 持续更新的学习资料

## 活动

华电三角洲全面战场校队招募中！欢迎各位新同学加入！报名表[https://docs.qq.com/form/page/DQUpjTHdjcVpjYkdE](https://docs.qq.com/form/page/DQUpjTHdjcVpjYkdE)

## 反馈与共建

现在急需各专业教材电子版，若愿意提供，请加下文的群联系@鹰仓茉子或者发邮件至 `1361942776@qq.com`，请注明校区、院系、专业、课程名、教材名、教材版本和出版社

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

::: cardList 1
```yaml
- name: 落点华电有趣青年
  desc: 华电最全 生活指南 | 资讯吐槽 | 校园故事 非官方自媒体
  avatar: /img/落点华电.jpg # 可选
  link: /img/落点二维码.jpg # 可选
  bgColor: '#CBEAFA' # 可选，默认var(--bodyBg)。颜色值有#号时请添加单引号
  textColor: '#6854A1' # 可选，默认var(--textColor)

```
:::