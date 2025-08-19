---
home: true
# heroImage: /img/logo.svg
heroText: NCEPUwiki
bannerBg: none # auto => 网格纹背景(有bodyBgImg时无背景)，默认 | none => 无 | '大图地址' | background: 自定义背景样式       提示：如发现文本颜色不适应你的背景时可以到palette.styl修改$bannerTextColor变量

# 文章列表显示方式: detailed 默认，显示详细版文章列表（包括作者、分类、标签、摘要、分页等）| simple => 显示简约版文章列表（仅标题和日期）| none 不显示文章列表
postList: none
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
</style>

<div class="feature-grid">
  <a class="feature-item" href="/categories/?category=%E6%96%B0%E7%94%9F">
    <img src="/img/school.svg" alt="入学指南">
    <div>入学指南</div>
  </a>
  <a class="feature-item" href="/categories/?category=群汇总">
    <img src="/img/group.svg" alt="群汇总">
    <div>群汇总</div>
  </a>
  <a class="feature-item" href="/categories/?category=课程教材与资料">
    <img src="/img/book.png" alt="课程教材与资料">
    <div>教材资料</div>
  </a>
</div>



## 欢迎访问 NCEPUwiki

NCEPUwiki是由华北电力大学同学共同维护的校园知识库，旨在为在校生提供：

- 高质量、结构化的信息资源  
- 实用的升学/学习经验分享  
- 持续更新的学习资料

## 反馈与共建

现在是网站建立初期，因此急需完善内容，尤其是[老乡群](/pages/fellowvillagers)、[新生入学](/pages/enterschool)，以及各专业教材和专业学习介绍，有意者可以进群联系@鹰仓茉子或者直接提交pull request

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