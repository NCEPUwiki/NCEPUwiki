# GNU／Linux发行版

**Linux distribution**

图源

https://github.com/FabioLolix/LinuxTimeline

https://upload.wikimedia.org/wikipedia/commons/1/1b/Linux_Distribution_Timeline.svg

![Linux_Distribution_Timeline](assets/Linux_Distribution_Timeline-20250821005446-ym8swq8.svg)

//本文使用层级目录确定继承关系

//列举常见linux distro

# **Debian**

软件包管理器**apt**

软件包格式 ***.deb**

全称Debian GNU/Linux,1993年创建,包含丰富软件仓库有近6万个软件包,有包管理工具dpkg,用于快速安装卸载升级查看本地.deb格式软件包,并基于dpkg开发上层包管理工具apt,用于直接从远程软件仓库下载并安装软件包,自动解决软件包依赖问题.  
严格遵守自由软件原则,始终忠于开源协议精神,是一个完全由社区驱动的项目  
有三种类型的发行版  
稳定版:每两年一发布(在偶数年发布),发布后提供长达5年的支持  
测试版:即将成为下一个稳定版的测试阶段版本,滚动升级,持续保持更新  
不稳定版:处于最活跃的开发状态,包含大量最新未经广泛测试的软件包,滚动升级,通常只有开发者推荐使用

## Kali

专为网络安全专家,安全研究员,渗透测试人员.默认安装超过600种安全工具

## deepin

deepin桌面环境,配备众多国产软件

## Ubuntu

发行版类型  
普通版:每6个月发布一个新版本(每年的4月和10月),提供9个月的支持和更新  
长期版(LTS)(Long term support):每两年一发布(在偶数年4月发布),发布后提供长达5年的支持  
采用YY.MM作为发布的版本号(YY是年份,MM是月份)  
还有ubuntu core为物联网和嵌入式设备提供的轻量级发行版

### Kubuntu

KDE-plasma桌面环境

### wubuntu

### Linux mint

### elementary OS

MacOS风格,使用罕见的**Pantheon 桌面环境**

# **RedHat系**

软件包管理器**yum**,**dnf**

软件包格式 ***.rpm**

## Fedora

Fedora Workstation主要针对开发者和个人桌面用户,配备精致用户友好的Gnome桌面环境(Linus Towards也是其爱好者)  
Fedora Server是一个功能强大,灵活且安全的服务器操作系统  
Fedora Cloud针对各大共有云厂商,以及私有云平台设计,适用云计算和虚拟化环境  
Fedora loT专为物联网和边缘计算设计,提供轻量灵活的平台,用于物联网开发和部署,专注安全性,连接性和资源使用率,适用于嵌入式系统和智能设备  
Fedora CoreOS专门用于运行容器化环境的操作系统,为确保系统的最优化,仅包含运行容器时所必须组件和核心库等文件,使其减小系统体积,降低安全风险  
包管理工具RPM,Red HatPackage Manager,基于RPM的高层包管理工具YUM,Yellowdog Updater Modified从本地或远程的软件仓库中安装软件包,同时自动解决软件包安装过程中遇到的依赖包问题,但在处理大型仓库和依赖关系解析时存在性能问题,推出DNF,DandifiedYum(从Fedora和RHEL8起取代Yum)

## CentOS

全称Community Enterprise Operating System.提供一个与RHEL完全兼容且开源免费的企业级Linux发行版.作为RHEL的下游分支,采用与RHEL完全相同的源代码,与RHEL完全同步,提供10年支持,使得用户无需支付RHEL订阅费,享受与RHEL完全一致的功能和稳定性,还能及时获取到相应的安全更新.2014年Red Hat收购CentOS,2019年Red Hat被IBM收购,CentOS Stream项目启动,2020.12遗弃CentOS.CentOS Stream滚动升级,系统持续保存更新,并将CentOS Stream介于Fedora和RHEL

## Red Hat Enterprise Linux

简称RHL,1995年创建红帽软件公司(营收来自企业级服务),2003将主营目标转向企业用户,分为两个分支  
面向企业的Red Hat Enterprise Linux(RHEL),每3-4年发布一个大版本,每个大版本提供长达10年的支持周期,并且会在每个大版本的生命周期中发布多个小版本(每6个月发布一次,通常为5月和11月),包含系统的安全更新,错误修复和硬件支持  
面向社区的Fedora,2003年由红帽发起并赞助的社区驱动项目,每半年发布更新(通常在每年4月和10月)拥有更新的内核版本和软件版本,但为了兼顾系统的稳定性,不会完全引入当下各个软件包以及内核的最新版本,同时Fedora作为RHEL的上游分支还肩负着测试的重任所有发布到RHEL上的新版本和新技术都是在Fedora上长期验证后.  
根据使用场景和用户需求不同,有多个不同版本

## Rocky

CentOS创始人重新创建一个CentOS相同定位的企业级Linux发行版,再次提供一个与RHEL完全兼容且开源免费的企业级Linux发行版

# openSUSE

# Gentoo Linux

# Arch Linux

包管理工具**pacman**

软件包格式 ***.pkg.tar.zst**

上述主要是以稳定为目的的Linux发行版,还存在许多专为Linux高级爱好者定制的Linux,2002年发布,主要面向个人桌面用户,Kiss原则,Keep it Simple,Stupid.尽可能保持系统的简洁性,没有任何多余组件,提供极高自由度,从内核配置到桌面环境,系统中涉及到的任何层面都支持用户对其自定义设置,这也导致archlinux安装和配置较为复杂,需要用户频繁维护更新系统.滚动更新模式,没有长期稳定版

## Cathy OS

## Manjaro

## SteamOS

# alpine

极度精简的轻量级Linux发行版,以小巧安全和效率著称,最初主要为嵌入式设备所设计,现在也用于构建容器化应用和微服务中(完整100mb,容器不到4mb).能够如此轻量,除了剔除不必要模块,集成了许多标准Linux工具的单个可执行文件,为在嵌入式系统和小型环境中,提供必要的命令行工具,shell命令,文件操作,网络工具等常用unix工具,以便在资源有限环境中运行  
系统的包管理器apk

# NixOS

‍
