![image](assets/simple-20250718232052-9aezwgz.png)

# ArchLinux's Installation

# <span data-type="text" style="color: var(--b3-font-color9);">准备</span>

在https://archlinux.org/download/下载ISO文件,刻录到U盘,设置BIOS/UEFI从U盘启动,进入终端界面

字体字号更换(可选)

​`setfont ter-132n    setfont ter-122b`​

命令行字体/usr/share/kbd/consolefonts/

# <span data-type="text" style="color: var(--b3-font-color9);">网络配置</span>

(ArchLinux的安装介质本质是特化的ArchLinux,所有的包都需要用pacman从镜像源获取,必须连接网络)

网线连接,无需配置

无线网卡,使用**iwctl**命令连接

```bash
iwctl	#进入工具界面,adapters(可插拔USB网卡),device(PCIE板载网卡)
device list    #列出无线网卡的名字(一般是wlan0)
station wlan0 scan    #搜索周边网络
station wlan0 get-networks    #列出搜索到的无线网络
station wlan0 connect $Network_name    #连接网络
exit	#退出后
ping -c 4 $ip_address/$domain_name	#检测WIFI是否连接成功
```

## 包管理器预设置

### 禁用 reflector 服务

2020 年，archlinux 安装镜像中加入了 `reflector` 服务，它会自己更新 `mirrorlist`（软件包管理器 `pacman` 的软件源）。在特定情况下，它会误删某些有用的源信息。这里进入安装环境后的第一件事就是将其禁用。也许它是一个好用的工具，但是很明显，因为地理上造成的特殊网络环境，这项服务并不适合启用。

通过以下命令将该服务禁用：

```zsh
systemctl stop reflector.service
```

通过以下命令查看该服务是否被禁用，按下 `q` 退出结果输出：

```zsh
systemctl status reflector.service
```

~~更换镜像源~~

```zsh
reflector --conutry China --age 24 --sort rate --protocol https --save /etc/pacman.d/mirrorlist
#寻找在中国的镜像源,24hour内更新过,按速度排序,https协议的镜像源,保存在某处
#效果极差,不推荐,建议手动修改镜像源
```

### **手动修改镜像源为国内软件仓库**

```zsh
vim /etc/pacman.d/mirrorlist

#镜像源越靠上优先级越高
#Pacman 会从 mirrorlist 文件的顶部开始逐行尝试镜像源。只有当前一个镜像失败（如连接超时、文件缺失）时，才会尝试下一个镜像
#Pacman 不会同时使用多个镜像分流下载。所有流量集中在一个镜像上，除非该镜像不可用
Server = https://mirrors.ustc.edu.cn/archlinux/$repo/os/$arch			# 中国科学技术大学开源镜像站
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch	# 清华大学开源软件镜像站
Server = https://mirrors.nju.edu.cn/archlinux/$repo/os/$arch			# 南京大学开源软件镜像站
Server = https://mirrors.xjtu.edu.cn/archlinux/$repo/os/$arch			# 西安交通大学开源镜像站
Server = https://mirrors.sjtug.sjtu.edu.cn/archlinux/$repo/os/$arch		# 上海交通大学开源镜像站

#可选，下载定期更新的镜像源列表到/etc/pacman.d/下,仅供查看
pacman -S pacman-mirrorlist
#可选
#并行下载选项
vim /etc/pacman.conf
将[options] 选项 ParallelDownloads 设置成正整数，例如 5，将会同时下载 5 个软件包，如果未设置此选项，软件包将会被依次下载。
```

更新软件列表

```zsh
pacman -Syy    #强制同步软件列表
```

# <span data-type="text" style="color: var(--b3-font-color9);">磁盘分区</span>

```zsh
#常用查看磁盘,分区,文件系统命令
lsblk -f	#list block,partiton,filesystem
df -h		#list filesystem
fdisk -l

fdisk    #MBR/GPT分区工具
gdisk    #GPT分区工具,p打印分区表,n建立新分区,d删除分区,w保存分区,q退出
选用一个即可
```

type:EFI system partiton  size:>=512MB    #多系统已有EFI就不用分区  
type:Linux filesystem  size:>\=100GB  
type:Linux swap  size(使用hibernate休眠功能,应和内存空间相近)

# <span data-type="text" style="color: var(--b3-font-color9);">格式化文件系统</span>

```bash
mkfs.敲Tab    #使用tab补全,查看可选择的文件系统
mkfs.fat -F 32 /dev/$efi_system_partition（EFI 系统分区)    #多系统已有EFI就不用格式化
mkfs.ext4 /dev/$root_partition（根分区）
mkswap /dev/$swap_partition（交换空间分区）
lsblk -f    #list block,partition,filesystem
```

# <span data-type="text" style="color: var(--b3-font-color9);">挂载分区</span>

```bash
mount  /dev/$root_partition  /mnt    #挂载根目录/
mkdir -p /mnt/boot
monut  /dev/$efi_system_partition  /mnt/boot    #挂载启动分区/boot
swapon  /dev/$swap_partition    #打开交换分区
lsblk
findmnt		#列出挂载的文件系统
```

# <span data-type="text" style="color: var(--b3-font-color9);">安装基本系统</span>

pacstrap是一个用于 **安装基础系统到新分区** 的核心工具，是 `arch-install-scripts` 包的一部分，专为 Arch Linux 的安装流程设计。将指定的软件包（包括基础系统）安装到一个新挂载的根文件系统（如 /mnt），为后续的系统配置做准备。

```bash
pacstrap  /mnt linux linux-headers linux-firmware  base  base-devel vim
#linux:The Linux kernel and modules;  
#linux-firmware:Firmware files for Linux;Split Packages:amd-ucode, linux-firmware-bnx2x, linux-firmware-liquidio, linux-firmware-marvell, linux-firmware-mellanox, linux-firmware-nfp, linux-firmware-qcom, linux-firmware-qlogic, linux-firmware-whence
#linux-headers:Headers and scripts for building modules for the Linux kernel  
#base:Minimal package set to define a basic Arch Linux installation    
#base-devel:Basic tools to build Arch Linux packages
注:pacstrap is a shellscript based on pacman;man pacstrap;pacstrap - install packages to the specified new root directory
软件包:arch-install-scripts包含下述工具(均是脚本)
arch-chroot
genfstab
pacstrap
注:vim可换成其他文本编辑器;可选安装bash-completion:Programmable completion for the bash shell
注:kernel's available options:linux最新版  linux-lts稳定版
```

除了 [linux](https://archlinux.org/packages/core/x86_64/linux/) 内核，还有以下官方支持的内核可供选择：(下述命令arch-chroot后再执行)

- [linux-lts](https://archlinux.org/packages/core/x86_64/linux-lts/) (core)

  - 包含了最新的长期支持的 Linux 内核和内核模块
  - 可以放心地在更长的时间内享受相同的内核版本
  - 若硬件不是最新硬件，则可以通过安装稍早的 LTS 内核提高稳定性
  - ```bash
    pacman -S linux-lts linux-lts-headers
    ```
- - [linux-zen](https://archlinux.org/packages/extra/x86_64/linux-zen/) (extra)

    - 一些内核黑客合作的结果，是适合日常使用的优秀内核
    - 以吞吐量和功耗为代价来换取性能
    - 相对 linux 内核加入了 Fsync 功能，在一些采用 .Net 的 wine 游戏中会有 明显的性能提升
    - ```bash
      pacman -S linux-zen linux-zen-headers
      ```

  [linux-hardened](https://archlinux.org/packages/extra/x86_64/linux-hardened/) (extra)

  - 更加注重安全的内核，采用一系列 加固补丁 以减少内核和用户空间产生漏洞的风险
  - 启用了一些加固选项，比如用户命名空间（同时通过补丁禁用未授权用户的访问）、审计以及 SELinux
  - 需要注意的是使用此内核时部分软件包将不起作用
  - ```bash
    pacman -S linux-hardened linux-hardened-headers
    ```

# <span data-type="text" style="color: var(--b3-font-color9);">配置系统</span>

```bash
genfstab  -U  /mnt  >  /mnt/etc/fstab
#genfstab=generate file system table;-U=UUID;
```

fstab文件用于定义磁盘分区，各种其他块设备或远程文件系统应如何装入文件系统。

一个简单的 /etc/fstab，使用文件系统 UUID:(不推荐使用设备文件如/dev/sda1)

```bash
# <device>                                <dir> <type> <options> <dump> <fsck>
UUID=0a3407de-014b-458b-b5c1-848e92a327a3 /     ext4   noatime   0      1
UUID=f9fe0b69-a280-415d-a03a-a32752370dee none  swap   defaults  0      0
UUID=b411dc99-f0a0-4c87-9e05-184977be8539 /home ext4   noatime   0      2
```

使用man fstab;man systemd.mount查看具体参数和含义

- ​`<device>` 描述要挂载的特定块设备或远程文件系统; 请见 [#文件系统标识](https://wiki.archlinuxcn.org/wiki/Fstab#%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F%E6%A0%87%E8%AF%86)。
- ​`<dir>` 描述[挂载](https://wiki.archlinuxcn.org/wiki/%E6%8C%82%E8%BD%BD "挂载")目录。
- ​`<type>` [文件系统](https://wiki.archlinuxcn.org/wiki/%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F "文件系统")类型。
- ​`<options>` 相关的挂载选项;

  |**选项**|**作用**|
  | ---------| ----------------------------------------------------------|
  |​`defaults`​|默认组合：`rw,suid,dev,exec,auto,nouser,async`​|
  |​`noatime`​|不更新文件访问时间，提升 I/O 性能（SSD 推荐）|
  |​`nodiratime`​|不更新目录访问时间|
  |​`discard`​|启用 TRIM（SSD 需开启）|
  |​`nofail`​|设备不存在时忽略错误，防止系统启动卡死（如移动硬盘/U盘）|
  |​`ro`/`rw`​|只读/读写模式|
  |​`user`​|允许普通用户挂载（默认仅 root 有权）|
- ​`<dump>` dump 工具是否备份该分区（0\=忽略，1\=备份）。通常设置为 `0`, 以禁用检查。
- ​`<fsck>` 设置引导时文件系统检查的顺序; fsck 启动时检查磁盘的顺序：0\=不检查，1\=根目录优先，2\=其他分区 ;(非根目录分区通常为2)

切换到新系统下

```bash
arch-chroot  /mnt    #change root到新系统
pacman -Syy
```

安装启动相关

```bash
pacman  -S  grub  efibootmgr  efivar(被efibootmgr依赖) os-prober(可选:多系统需用)
#grub:GNU GRand Unified Bootloader;包组grub-bios, grub-common, grub-efi-x86_64, grub-emu
#efibootmgr:Linux user-space application to modify the EFI Boot Manager
#efivar:Tools and libraries to work with EFI variables
#os-prober:Utility to detect other OSes on a set of drives
```

安装网络相关

```bash
pacman  -S  networkmanager
#networkmanager:Network connection manager and user applications
#软件包包含一个守护程序、一个命令行界面（nmcli）和一个基于 curses 的界面（nmtui）
```

安装CPU微码包

```bash
pacman -S amd-ucode  (amdCPU安装此包)
pacman -S inter-ucode  (interCPU安装此包)
#二选一即可,已有时再次安装会失败
#必须在grub-mkconfig前安装,且确保确保 /etc/default/grub 未禁用微码加载
```

- **微码（Microcode）**  是 CPU 厂商（AMD/Intel）发布的固件更新，通过启动加载器（如 GRUB）在系统启动时加载。用于：

  - **修复硬件缺陷**：如安全漏洞（如 Spectre、Meltdown）、稳定性问题。
  - **优化性能**：可能提升能效或指令执行效率。

  - **安全性**：修复已知 CPU 漏洞（如 Zen 架构的某些缺陷）。
  - **稳定性**：避免因硬件问题导致的崩溃或异常行为。
  - **兼容性**：确保新硬件（如 Ryzen 7000 系列）正确支持。

‍

启动项grub安装到efi分区

```bash
grub-install  --target=x86_64-efi  --efi-directory=/boot/efi  --bootloader-id=GRUB	
#EFI分区扫描.efi文件,生成/boot/efi/EFI/GRUB/grubx64.efi,并修改UEFI启动文件为grubx64.efi
#--bootloader-id选项的作用:改变EFI下GRUB文件夹名;UEFI 启动菜单中会显示 "GRUB"
#/boot/efi/EFI/GRUB/grubx64.efi
#如果 --bootloader-id 的名称与现有 EFI 目录冲突（如已存在 /boot/efi/EFI/Windows），GRUB 会覆盖或合并文件，需谨慎操作。
```

修改grub配置(可选)

```bash
#出于安全考虑os-prober默认被禁用
#启用os-prober
vim  /etc/default/grub
#去注释
GRUB_DISABLE_OS_PROBER=false
```

```bash
vim /etc/default/grub

在适当位置添加或修改为如下三行：
GRUB_DEFAULT=saved # 使用保存的内核条目,让 GRUB 记住最后在 GRUB 引导菜单里选择的内核，以便在下次启动时自动使用对应的内核
GRUB_SAVEDEFAULT=true # 保存最后一个使用的内核条目
GRUB_DISABLE_SUBMENU=y # 可选，禁用 GRUB 子菜单，使选择内核的操作更简单
GRUB_TIMEOUT=2 #使停留时间为2秒GRUB_TIMEOUT=2 
GRUB_CMDLINE_LINUX_DEFAULT="loglevel=3" #日志文件记录更详细

安装完毕后通过以下命令更新一下引导配置即可：
grub-mkconfig -o /boot/grub/grub.cfg
```

保存配置文件

```bash
grub-mkconfig  -o  /boot/grub/grub.cfg    #生成grub配置文件保存到/boot/grub/grub.cfg
efibootmgr -v	#可选,查看已注册的 EFI 引导条目
```

网络服务自启动

```zsh
systemctl  enable  NetworkManager
```

root用户密码设置

```bash
passwd
```

设置主机名

```bash
 vim  /etc/hostname  随便取个名字
```

系统时间和硬件时间设置

```bash
timedatectl  set-timezone  Asia/Shanghai    #设定时区
timedatectl  set-ntp  true    #网络时间同步
timedatectl  status    #显示状态
timedatectl  set-local-rtc  1  #将硬件时间设为本地时区时间,解决win和linux时间不同步问题
#后面安装桌面时,可能重置此处
```

退出新系统,卸载分区,拔出安装介质

```
exit
umount  /mnt/boot
umount  /mnt
lsblk
reboot
```

拔出安装U盘;进入新安装的Linux系统

自此ArchLinux最基本系统已安装完成!

---

---

---

# 新系统基本配置

登录root用户  login in root

重新连接网络,使用**nmcli**命令

```bash
nmcli device wifi list	#显示附近的 Wi-Fi 网络
nmcli device wifi connect SSID_或_BSSID password 密码	#连接到 Wi-Fi 网络
nmcli device	#显示所有网络设备及其状态
```

主机名-域名-IP地址映射

~~修改bash配置(现在默认配置很好不用动)vim  /etc/skel/.bashrc    可修改变量PS1,可修改环境变量默认文本编辑器export  EDITOR=vim,可类比alias  ls='ls  --color=auto'使grep搜索出的结果带有颜色alias grep='grep  --color=auto' 保存后用skel文件夹下所有文件覆盖home目录下的.bashrc文件cd  /etc/skel    cp  -a  .~~    ~~~~~      ~~//保留原文件属性的前提下复制文件~~

创建普通用户

```bash
useradd  -m -G 用户组 用户名    #创建用户
#-m,--create-home 如果用户的主目录不存在,则创建它(默认会将/etc/skel下的文件拷贝到新用户的家目录下)
#-G,--groups GROUP1[GROUP2,GROUP#...]  将用户添加到用户组
#-u,--uid UID     指定user的uid
#-s,--shell SHELL	指定登入时的默认shell
#-g,--gid GROUP    指定新用户的基本组
#-G,--groups GROUPS  指定新用户加入指定附加组

id  用户名    #查看uid,gid,groups  ?
passwd 用户名   #设置密码
usermod    #修改用户组  ?
vim  /etc/sudoers    
#修改配置文件使普通用户可sudo
#思路一:将普通用户加入wheel组,去# %whell  =ALL=(ALL:ALL)  ALL行注释
#思路二:在root  ALL=(ALL:ALL)  ALL下加 用户名  ALL=(ALL:ALL)  ALL

#ALL= —— 主机名，此处则代表在所有主机上都生效（如果把同样的 sudoers 文件下发到了多个主机上）
#(ALL:ALL) —— (任意用户:任意用户组)，此处则代表可以成为任意目标用户/用户组
#最后的 ALL —— 代表可以执行任意命令
```

配置系统支持的语言环境

```bash
/etc/locale.gen 去掉en_US.UTF-8 UTF-8和zh_CN.UTF-8 UTF_8前面的#
locale-gen    #根据/etc/locale.gen生成本地化文件
locale -a	  #查看所有可用的 locale
```

设置系统默认语言环境

```bash
vim  /etc/locale.conf    输入LANG=en_US.UTF-8
#此处设置美式英文环境,终端不支持中文字符(如果需要,安装图形界面后再切换为中文环境)
```

---

# 新系统进阶配置

## 终端控制台(TTY)配置

终端字体配置

提示：文本控制台只支持位图字体（.psf.gz格式），不支持TrueType字体

/usr/share/kbd/consolefonts	#控制台字体保存目录

terminus-font	#Monospace bitmap font (for X11 and console)

```bash
pacman -S terminus-font		#安装终端字体包

setfont				#切换默认字体
setfont  ter-132b	#切换终端字体
showconsolefont		#显示当前字体
```

修改bash的命令提示符(终端模拟器中也生效)

```bash
vim ~/.bashrc

在自定义提示符（如添加颜色）时，ANSI转义序列必须用\[和\]包裹，否则Bash无法正确识别非打印字符的长度。
#原本格式
\e[颜色代码m内容\e[0m
#正确格式
\[\e[颜色代码m\]内容\[\e[0m\]
颜色代码=代码1;代码2;...;代码n	#效果叠加

#原配置
PS1='[\u@\h \W]\$ '
#原配置(显示目录完整路径)
PS1='[\u@\h \w]\$ '
#极简配置
PS1='\u \w \$ '

#示例
PS1='[\[\e[1m\]\u\[\e[0m\]@\[\e[1m\]\h\[\e[0m\] \[\e[1;96m\]\w\[\e[0m\]]\$ '
```

### Bash Shell 提示符转义序列

用于动态自定义命令行提示符

- ​`\a`: 发出一个响铃声（警报）。
- ​`\d`: 显示日期，格式为“Tue May 17”。
- ​`\D{format}`: 使用 `strftime` 函数显示格式化日期和时间。例如：`\D{%F %T}` 会显示为“2024-05-17 13:37:42”。
- ​`\e`: 转义字符（ASCII 码 27）。
- ​`\h`: 主机名（仅显示第一个点之前的部分）。
- ​`\H`: 完整的主机名。
- ​`\j`: 当前 Shell 会话中正在运行的后台任务数。
- ​`\l`: 当前终端设备的名称（例如，`tty1`）。
- ​`\n`: 换行符。
- ​`\r`: 回车符。
- ​`\s`: Shell 的名称（即，执行该实例的基本名称，如 `bash`）。
- ​`\t`: 当前时间，格式为24小时制 HH:MM:SS。
- ​`\T`: 当前时间，格式为12小时制 HH:MM:SS。
- ​`\@`: 当前时间，格式为12小时制带AM/PM。
- ​`\A`: 当前时间，格式为24小时制 HH:MM。
- ​`\u`: 当前用户名。
- ​`\v`: Bash 的版本号（例如，4.4）。
- ​`\V`: Bash 的版本信息（例如，4.4.12(1)-release）。
- ​`\w`: 当前工作目录。
- ​`\W`: 当前工作目录的最后一个目录名。
- ​`\!`: 当前命令在历史中的编号。
- ​`\#`: 当前命令的编号（这个数字会递增）。
- ​`\$`: 如果是普通用户则显示 `$`，如果是超级用户（root）则显示 `#`。
- ​`\nnn`: 使用八进制值 `nnn` 表示的字符（例如，`\007` 表示一个响铃声）。
- ​`\\`: 反斜杠自身。
- ​`\[`: 表示非打印字符的开始（用于嵌入终端控制序列）。
- ​`\]`: 表示非打印字符的结束。

## 开启32位支持库(Mutilib)与Arch Linux中文社区仓库(archlinuxcn)

添加repository:Archlinxcn

```bash
vim /etc/pacman.conf
在文档结尾处加入下面的文字，来添加 archlinuxcn 源。推荐的镜像源（选一个即可）也一并列出：
[archlinuxcn]
Server = https://mirrors.ustc.edu.cn/archlinuxcn/$arch # 中国科学技术大学开源镜像站
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinuxcn/$arch # 清华大学开源软件镜像站
Server = https://mirrors.hit.edu.cn/archlinuxcn/$arch # 哈尔滨工业大学开源镜像站
Server = https://repo.huaweicloud.com/archlinuxcn/$arch # 华为开源镜像站

sudo pacman -S archlinuxcn-keyring # cn 源中的签名（archlinuxcn-keyring 在 archlinuxcn）
#可选,下载定期更新的镜像源列表到/etc/pacman.d/下,仅供查看并不起作用
sudo pacman -S archlinuxcn-mirrorlist-git
```

添加repository:Mutilib

```bash
vim /etc/pacman.conf
去掉 [multilib] 一节中两行的注释，来开启 32 位库支持
```

通过以下命令刷新 `pacman` 数据库并更新：

```bash
pacman -Syyu
```

## BlueTooth

安装必备组件

```bash
pacman -S bluez bluez-libs
#bluez:Daemons for the bluetooth protocol stack
#bluez-libs:Deprecated libraries for the bluetooth protocol stack

#多数笔记本的蓝牙硬件集成在无线网卡上
#通常在安装plasma桌面时蓝牙组件都已经安装
#然而蓝牙进程通常并未启动，需手动启动
systemctl enable --now bluetooth.service

#使用蓝牙传输文件
pacman -S blue-obex
#启动进程,桌面端无需启动
systemcctl --user enable --now obex.service
```

命令行交互

```bash
bluetoothctl
#进入bluetooth子shell
power on	#打开蓝牙
scan on	#扫描设备
devices #已保存(配对)的设备
info	#正在连接的蓝牙设备
connect  MAC地址	#连接
disconnect  MAC地址	#断开连接
trust MAC地址	#信任，发现设备自动连接
untrust MAC地址

```

## 管理和操作存储设备(以普通用户权限)

udisks2

## 开机自动挂载

资料详解:https://wiki.archlinuxcn.org/wiki/Fstab

挂载 **外部存储设备**（如 NTFS/FAT32 格式的 U 盘或硬盘）或 **非 Linux 原生文件系统**，目的是：

- 提供读写支持（`rw`）。**读写模式**：允许对文件系统进行读写操作
- 增强安全性（`nosuid, nodev`）。**禁用 SUID/SGID**：阻止 `setuid`/`setgid` 权限位生效（如 `sudo` 这类特权程序无法提权），增强安全性。**禁用设备文件**：忽略文件系统中的设备文件（如 `/dev/sda1`），防止潜在的安全风险。
- 优化性能（`relatime`）。**优化访问时间更新**：仅在文件被修改或最后一次访问时间过久时更新 `atime`（访问时间），减少磁盘 I/O，提升性能。
- 解决权限问题（`uid/gid` 指定用户/组归属）。
- 控制默认权限（`fmask/dmask`）。**文件权限掩码**：新创建文件的权限为 `644`（所有者读写，其他人只读）。**目录权限掩码**：新创建目录的权限为 `755`（所有者完全访问，其他人读和执行）。
- 兼容非英文字符（`iocharset=utf8`）。**字符集编码**：使用 UTF-8 编码处理文件名，确保非 ASCII 字符（如中文）正确显示。
- 防止数据损坏（`errors=remount-ro`）。**错误处理**：遇到文件系统错误时自动重新挂载为只读模式，防止数据损坏，便于修复。

```bash
vim /etc/fstab

添加下面内容
# /dev/nvme0n1p4 LABEL=Data
UUID=6433-32A8      	/mnt/Data	exfat     	rw,nosuid,nodev,relatime,uid=1000,gid=1000,fmask=0133,dmask=0022,iocharset=utf8,errors=remount-ro	0 2
```

# KDE-plasma桌面环境安装

桌面环境必备软件已经打包成一个包组:**plasma**

等同的元包:**plasma-meta**

```bash
pacman -S plasma-meta
# plasma-meta 元软件包，依赖plasma组中的所有包。
pacman -S plasma 
# plasma 软件包组 
#上面两者包含的软件完全相同,但是更新可能不同步,安装其中之一即可

pacman -S  plasma-desktop
# Plasma 的最小安装(尚未测试)
```

plasma既安装xorg，又安装wayland

由于使用 Wayland 协议的显示服务器也可作为混成窗口管理器，因此被称为混成器（compositors）。

plasma内置Wayland混成器KWin

安装并开启 sddm.service 守护进程：

```bash
pacman -S sddm #包含于plasma中，安装plasma时已经自动安装
systemctl enable sddm #开机自启sddm
```

通过以下命令启动显示管理器或重启电脑，即可看到欢迎界面：

```bash
systemctl start sddm  # 直接启动显示管理器，与以下reboot命令二选一即可
reboot
选择 Plasma (Wayland) 以在 Wayland 下开启新会话
```

plasma包组所含软件包

||||||||
| ------------| -------| --| -----------| --------------------------------------------------------------------------------------------| ------------| --|
|x86\_64|Extra|[aurorae](https://archlinux.org/packages/extra/x86_64/aurorae/ "View package details for aurorae")|6.4.3-1|A themeable window decoration for KWin|2025-07-15||
|x86\_64|Extra|[bluedevil](https://archlinux.org/packages/extra/x86_64/bluedevil/ "View package details for bluedevil")|1:6.4.3-1|Integrate the Bluetooth technology within KDE workspace and applications|2025-07-15||
|x86\_64|Extra|[breeze](https://archlinux.org/packages/extra/x86_64/breeze/ "View package details for breeze")|6.4.3-1|Artwork, styles and assets for the Breeze visual style for the Plasma Desktop|2025-07-15||
|any|Extra|[breeze-gtk](https://archlinux.org/packages/extra/any/breeze-gtk/ "View package details for breeze-gtk")|6.4.3-1|Breeze widget theme for GTK 2 and 3|2025-07-15||
|x86\_64|Extra|[breeze-plymouth](https://archlinux.org/packages/extra/x86_64/breeze-plymouth/ "View package details for breeze-plymouth")|6.4.3-1|Plymouth theme for the Breeze visual style for the Plasma Desktop|2025-07-15||
|x86\_64|Extra|[discover](https://archlinux.org/packages/extra/x86_64/discover/ "View package details for discover")|6.4.3-1|KDE and Plasma resources management GUI|2025-07-15||
|x86\_64|Extra|[drkonqi](https://archlinux.org/packages/extra/x86_64/drkonqi/ "View package details for drkonqi")|6.4.3-1|The KDE crash handler|2025-07-15||
|x86\_64|Extra|[flatpak-kcm](https://archlinux.org/packages/extra/x86_64/flatpak-kcm/ "View package details for flatpak-kcm")|6.4.3-1|Flatpak Permissions Management KCM|2025-07-15||
|x86\_64|Extra|[kactivitymanagerd](https://archlinux.org/packages/extra/x86_64/kactivitymanagerd/ "View package details for kactivitymanagerd")|6.4.3-1|System service to manage user activities and track the usage patterns|2025-07-15||
|x86\_64|Extra|[kde-cli-tools](https://archlinux.org/packages/extra/x86_64/kde-cli-tools/ "View package details for kde-cli-tools")|6.4.3-1|Tools based on KDE Frameworks to better interact with the system|2025-07-15||
|x86\_64|Extra|[kde-gtk-config](https://archlinux.org/packages/extra/x86_64/kde-gtk-config/ "View package details for kde-gtk-config")|6.4.3-1|Syncs KDE settings to GTK applications|2025-07-15||
|x86\_64|Extra|[kdecoration](https://archlinux.org/packages/extra/x86_64/kdecoration/ "View package details for kdecoration")|6.4.3-1|Plugin based library to create window decorations|2025-07-15||
|x86\_64|Extra|[kdeplasma-addons](https://archlinux.org/packages/extra/x86_64/kdeplasma-addons/ "View package details for kdeplasma-addons")|6.4.3-1|All kind of addons to improve your Plasma experience|2025-07-15||
|x86\_64|Extra|[kgamma](https://archlinux.org/packages/extra/x86_64/kgamma/ "View package details for kgamma")|6.4.3-1|Adjust your monitor gamma settings|2025-07-15||
|x86\_64|Extra|[kglobalacceld](https://archlinux.org/packages/extra/x86_64/kglobalacceld/ "View package details for kglobalacceld")|6.4.3-1|Daemon providing Global Keyboard Shortcut (Accelerator) functionality|2025-07-15||
|x86\_64|Extra|[kinfocenter](https://archlinux.org/packages/extra/x86_64/kinfocenter/ "View package details for kinfocenter")|6.4.3-1|A utility that provides information about a computer system|2025-07-15||
|x86\_64|Extra|[kmenuedit](https://archlinux.org/packages/extra/x86_64/kmenuedit/ "View package details for kmenuedit")|6.4.3-1|KDE menu editor|2025-07-15||
|x86\_64|Extra|[kpipewire](https://archlinux.org/packages/extra/x86_64/kpipewire/ "View package details for kpipewire")|6.4.3-1|Components relating to pipewire use in Plasma|2025-07-15||
|x86\_64|Extra|[krdp](https://archlinux.org/packages/extra/x86_64/krdp/ "View package details for krdp")|6.4.3-1|Library and examples for creating an RDP server|2025-07-15||
|x86\_64|Extra|[kscreen](https://archlinux.org/packages/extra/x86_64/kscreen/ "View package details for kscreen")|6.4.3-1|KDE screen management software|2025-07-15||
|x86\_64|Extra|[kscreenlocker](https://archlinux.org/packages/extra/x86_64/kscreenlocker/ "View package details for kscreenlocker")|6.4.3-1|Library and components for secure lock screen architecture|2025-07-15||
|x86\_64|Extra|[ksshaskpass](https://archlinux.org/packages/extra/x86_64/ksshaskpass/ "View package details for ksshaskpass")|6.4.3-1|ssh-add helper that uses kwallet and kpassworddialog|2025-07-15||
|x86\_64|Extra|[ksystemstats](https://archlinux.org/packages/extra/x86_64/ksystemstats/ "View package details for ksystemstats")|6.4.3-1|A plugin based system monitoring daemon|2025-07-15||
|x86\_64|Extra|[kwallet-pam](https://archlinux.org/packages/extra/x86_64/kwallet-pam/ "View package details for kwallet-pam")|6.4.3-1|KWallet PAM integration|2025-07-15||
|x86\_64|Extra|[kwayland](https://archlinux.org/packages/extra/x86_64/kwayland/ "View package details for kwayland")|6.4.3-1|Qt-style Client and Server library wrapper for the Wayland libraries|2025-07-15||
|x86\_64|Extra|[kwin](https://archlinux.org/packages/extra/x86_64/kwin/ "View package details for kwin")|6.4.3-1|An easy to use, but flexible, Wayland compositor|2025-07-15||
|x86\_64|Extra|[kwin-x11](https://archlinux.org/packages/extra/x86_64/kwin-x11/ "View package details for kwin-x11")|6.4.3-1|An easy to use, but flexible, X Window Manager|2025-07-15||
|x86\_64|Extra|[kwrited](https://archlinux.org/packages/extra/x86_64/kwrited/ "View package details for kwrited")|6.4.3-1|KDE daemon listening for wall and write messages|2025-07-15||
|x86\_64|Extra|[layer-shell-qt](https://archlinux.org/packages/extra/x86_64/layer-shell-qt/ "View package details for layer-shell-qt")|6.4.3-1|Qt component to allow applications to make use of the Wayland wl-layer-shell protocol|2025-07-15||
|x86\_64|Extra|[libkscreen](https://archlinux.org/packages/extra/x86_64/libkscreen/ "View package details for libkscreen")|6.4.3-1|KDE screen management software|2025-07-15||
|x86\_64|Extra|[libksysguard](https://archlinux.org/packages/extra/x86_64/libksysguard/ "View package details for libksysguard")|6.4.3-1|Library to retrieve information on the current status of computer hardware|2025-07-15||
|x86\_64|Extra|[libplasma](https://archlinux.org/packages/extra/x86_64/libplasma/ "View package details for libplasma")|6.4.3-1|Plasma library and runtime components|2025-07-15||
|x86\_64|Extra|[milou](https://archlinux.org/packages/extra/x86_64/milou/ "View package details for milou")|6.4.3-1|A dedicated search application built on top of Baloo|2025-07-15||
|any|Extra|[ocean-sound-theme](https://archlinux.org/packages/extra/any/ocean-sound-theme/ "View package details for ocean-sound-theme")|6.4.3-1|Ocean Sound Theme for Plasma|2025-07-15||
|x86\_64|Extra|[oxygen](https://archlinux.org/packages/extra/x86_64/oxygen/ "View package details for oxygen")|6.4.3-1|KDE Oxygen style|2025-07-15||
|any|Extra|[oxygen-sounds](https://archlinux.org/packages/extra/any/oxygen-sounds/ "View package details for oxygen-sounds")|6.4.3-1|The Oxygen Sound Theme|2025-07-15||
|x86\_64|Extra|[plasma5support](https://archlinux.org/packages/extra/x86_64/plasma5support/ "View package details for plasma5support")|6.4.3-1|Support components for porting from KF5/Qt5 to KF6/Qt6|2025-07-15||
|x86\_64|Extra|[plasma-activities](https://archlinux.org/packages/extra/x86_64/plasma-activities/ "View package details for plasma-activities")|6.4.3-1|Core components for KDE Activities|2025-07-15||
|x86\_64|Extra|[plasma-activities-stats](https://archlinux.org/packages/extra/x86_64/plasma-activities-stats/ "View package details for plasma-activities-stats")|6.4.3-1|A library for accessing the usage data collected by the activities system|2025-07-15||
|x86\_64|Extra|[plasma-browser-integration](https://archlinux.org/packages/extra/x86_64/plasma-browser-integration/ "View package details for plasma-browser-integration")|6.4.3-1|Components necessary to integrate browsers into the Plasma Desktop|2025-07-15||
|x86\_64|Extra|[plasma-desktop](https://archlinux.org/packages/extra/x86_64/plasma-desktop/ "View package details for plasma-desktop")|6.4.3-1|KDE Plasma Desktop|2025-07-15||
|x86\_64|Extra|[plasma-disks](https://archlinux.org/packages/extra/x86_64/plasma-disks/ "View package details for plasma-disks")|6.4.3-1|Monitors S.M.A.R.T. capable devices for imminent failure|2025-07-15||
|x86\_64|Extra|[plasma-firewall](https://archlinux.org/packages/extra/x86_64/plasma-firewall/ "View package details for plasma-firewall")|6.4.3-1|Control Panel for your system firewall|2025-07-15||
|x86\_64|Extra|[plasma-integration](https://archlinux.org/packages/extra/x86_64/plasma-integration/ "View package details for plasma-integration")|6.4.3-1|Qt Platform Theme integration plugins for the Plasma workspaces|2025-07-15||
|x86\_64|Extra|[plasma-nm](https://archlinux.org/packages/extra/x86_64/plasma-nm/ "View package details for plasma-nm")|6.4.3-1|Plasma applet written in QML for managing network connections|2025-07-15||
|x86\_64|Extra|[plasma-pa](https://archlinux.org/packages/extra/x86_64/plasma-pa/ "View package details for plasma-pa")|6.4.3-1|Plasma applet for audio volume management using PulseAudio|2025-07-15||
|x86\_64|Extra|[plasma-sdk](https://archlinux.org/packages/extra/x86_64/plasma-sdk/ "View package details for plasma-sdk")|6.4.3-1|Applications useful for Plasma development|2025-07-15||
|x86\_64|Extra|[plasma-systemmonitor](https://archlinux.org/packages/extra/x86_64/plasma-systemmonitor/ "View package details for plasma-systemmonitor")|6.4.3-1|An interface for monitoring system sensors, process information and other system resources|2025-07-15||
|x86\_64|Extra|[plasma-thunderbolt](https://archlinux.org/packages/extra/x86_64/plasma-thunderbolt/ "View package details for plasma-thunderbolt")|6.4.3-1|Plasma integration for controlling Thunderbolt devices|2025-07-15||
|x86\_64|Extra|[plasma-vault](https://archlinux.org/packages/extra/x86_64/plasma-vault/ "View package details for plasma-vault")|6.4.3-1|Plasma applet and services for creating encrypted vaults|2025-07-15||
|x86\_64|Extra|[plasma-welcome](https://archlinux.org/packages/extra/x86_64/plasma-welcome/ "View package details for plasma-welcome")|6.4.3-1|A friendly onboarding wizard for Plasma|2025-07-15||
|x86\_64|Extra|[plasma-workspace](https://archlinux.org/packages/extra/x86_64/plasma-workspace/ "View package details for plasma-workspace")|6.4.3-1|KDE Plasma Workspace|2025-07-15||
|any|Extra|[plasma-workspace-wallpapers](https://archlinux.org/packages/extra/any/plasma-workspace-wallpapers/ "View package details for plasma-workspace-wallpapers")|6.4.3-1|Additional wallpapers for the Plasma Workspace|2025-07-15||
|x86\_64|Extra|[plymouth-kcm](https://archlinux.org/packages/extra/x86_64/plymouth-kcm/ "View package details for plymouth-kcm")|6.4.3-1|KCM to manage the Plymouth (Boot) theme|2025-07-15||
|x86\_64|Extra|[polkit-kde-agent](https://archlinux.org/packages/extra/x86_64/polkit-kde-agent/ "View package details for polkit-kde-agent")|6.4.3-1|Daemon providing a polkit authentication UI for KDE|2025-07-15||
|x86\_64|Extra|[powerdevil](https://archlinux.org/packages/extra/x86_64/powerdevil/ "View package details for powerdevil")|6.4.3-1|Manages the power consumption settings of a Plasma Shell|2025-07-15||
|x86\_64|Extra|[print-manager](https://archlinux.org/packages/extra/x86_64/print-manager/ "View package details for print-manager")|1:6.4.3-1|A tool for managing print jobs and printers|2025-07-15||
|x86\_64|Extra|[qqc2-breeze-style](https://archlinux.org/packages/extra/x86_64/qqc2-breeze-style/ "View package details for qqc2-breeze-style")|6.4.3-1|Applications useful for Plasma development|2025-07-15||
|x86\_64|Extra|[sddm-kcm](https://archlinux.org/packages/extra/x86_64/sddm-kcm/ "View package details for sddm-kcm")|6.4.3-1|KDE Config Module for SDDM|2025-07-15||
|x86\_64|Extra|[spectacle](https://archlinux.org/packages/extra/x86_64/spectacle/ "View package details for spectacle")|1:6.4.3-1|KDE screenshot capture utility|2025-07-15||
|x86\_64|Extra|[systemsettings](https://archlinux.org/packages/extra/x86_64/systemsettings/ "View package details for systemsettings")|6.4.3-1|KDE system manager for hardware, software, and workspaces|2025-07-15||
|x86\_64|Extra|[wacomtablet](https://archlinux.org/packages/extra/x86_64/wacomtablet/ "View package details for wacomtablet")|6.4.3-1|GUI for Wacom Linux drivers that supports different button/pen layout profiles|2025-07-15||
|x86\_64|Extra|[xdg-desktop-portal-kde](https://archlinux.org/packages/extra/x86_64/xdg-desktop-portal-kde/ "View package details for xdg-desktop-portal-kde")|6.4.3-1|A backend implementation for xdg-desktop-portal using Qt/KF5|2025-07-15||

参考链接:[KDE - Arch Linux 中文维基](https://wiki.archlinuxcn.org/wiki/KDE),[KDE官网](https://www.kde.org/plasma-desktop),[plasma包组](https://archlinux.org/groups/x86_64/plasma/)

---

# KDE-plasma桌面配置

KDE应用的大部分配置存储于 \~/.config 目录下。KDE 主要使用"系统设置"调整配置，也可以在终端执行 systemsettings 启动它。

plasma桌面语言不由/etc/locale.gen和/etc/locale.conf决定

KDE-Plasma 也通过系统设置修改界面的语言，如果按本文修改后还是原来的区域设置，请删除 /.config/plasma-localerc (之前是：/.config/plasma-locale-settings.sh)。

## plasma桌面字体设置

**System Setting -&gt; Font Management**

list an preview all fonts

**System Setting -&gt; Fonts**

- General: Used everywhere when the other font groups do not apply(通用，影响大部分内容)
- Fixed width: Anywhere a non-proportional font is specified(等宽字体,影响Konsole)
- Small: When small fonts are used
- Toolbar: Font used in KDE application toolbars
- Menu: Font used in KDE application menus
- Window title: Font used in the window title

Anti-Aliasing:(抗锯齿)

Sub-pixel rendering:(亚像素渲染)

Hinting:(微调)

## Screen Locking

Lock screen automatically:30minutes

## Power Manangement

On AC Power:When inactive Do nothing

### sleep(睡眠)

Standby:Save session to memory

Hybrid sleep:Save session to both memory and disk

Standby,then hibernate:Switch to hibernation after period of inactity

### hibernate(休眠)

## Night Light(护眼模式)

System Settings -> Colors&Themes

Switching times:Always on night light

## Icons-Only Task Manager(桌面最下端任务栏)

rightclick -> Configure Icons-Only Task Manager -> Behavior

Middle-clicking any task:Opens a new window (中键打开新窗口)

rightclick -> Show Panel Configuration

Visibility:Auto Hide

## file search

System Settings -> Workspace -> File Search

选择想要索引的文件夹,推荐禁用索引

## kwallet

默认密码是创建用户时设置的用户密码

如果修改用户密码会导致开机不能自动打开kwallet读取其中的wifi密码等

## dolphin

https://wiki.archlinuxcn.org/wiki/Dolphin

配置文件

~/.config/dolphinrc

管理右键菜单(重启dolphin后方才生效)

dolphinToolbars(Settings)->Configure Dolphin->Context Menu

管理快捷键(重启dolphin后方才生效)

dolphinToolbars(Settings)->Configure Keyboard Shortcuts

左栏Places添加快捷文件/文件夹入口

Places -> right click -> Add Entry

**常用快捷键**

alt+.	#切换隐藏文件(夹)可见性

**插件**

- dolphin-plugins  
  启用git:Settings -> Configura Dolphin -> Context Menu -> (enable) git

## konsole

**使用breeze或者其他主题颜色覆盖叠加导致异常**

konsole窗口右上角(Open Menu) -> Create New Profile(如设置profile name为konsole1) -> Appearance (选Linux Colors或者White on Black可确保颜色正常)

konsole窗口右上角(Open Menu) -> Settings -> Profiles ->将该配置Set as Default

~~真彩程序无法正确显示~~

```bash
vim ~/.local/share/konsole/konsole.profile

[General]
Name=konsole
Environment=TERM=konsole-256color,COLORTERM=truecolor
#默认TERM=xterm-256color
```

配置文件保存在~/.local/share/konsole/

# KDE-plasma桌面美化

**rice**

在 Linux 用户和开源社区的口中,rice并不是指大米，而是对操作系统（尤其是桌面环境）进行**深度美学定制和美化**的行为。它源于 "Race-Inspired Cosmetic Enhancements"（受赛车启发的装饰性改装）的首字母缩写，后来在技术圈被引申为对计算环境的视觉改造。

追求的是极致的个性化视觉体验，而不仅仅是默认的实用功能。

参考:https://www.bilibili.com/video/BV17TDEYUEu2/

### 自动切换白天/夜晚主题

KDE 6.16(尚未加入)

### sddm

sddm-kcm	#KDE Config Module for SDDM  
包含于plasma包组中，提供了一个图形用户界面以在 Plasma 系统设置中配置 SDDM

启用themes: Settings -> Colors&Themes -> Login Screen(SDDM)

将用户配置同步到sddm主题(解决字体不一致,太小等问题):Settings -> Colors&Themes -> Login Screen(SDDM) -> Apply Plasma Settings(Apply)

默认配置文件 /usr/lib/sddm/sddm.conf.d/default.conf  
配置文件/etc/sddm.conf  
修改配置，请在 /etc/sddm.conf.d/ 目录下创建配置文件。详见https://man.archlinux.org/man/sddm.conf.5以获得所有配置选项。

预览主题`sddm-greeter-qt6 --test-mode --theme /usr/share/sddm/themes/breeze`​

用户图标（头像）Settings -> Users中设置

# 软件包推荐

### 文件管理器File manager

**dolphin**

### 终端模拟(仿真)器terminal emulator

**konsole**		#KDE terminal

### 浏览器Web browser   PDF viewer

**firefox**		#火狐浏览器

**chromium**	#Google浏览器(社区驱动,完全开源)

### 文本编辑器Text Editor

**vim**		#workwell in console

kate		#Advanced text editor

visual studio code

### 音视频处理Music&Video editor

**ffmpeg**

### 音频播放器Music player

mpd	(Music Player Daemon)音乐播放守护进程

mpc	(Music Player Client)音乐播放客户端

ncmpcpp	(NCurses Music Player Client Plus Plus)	ncmpc的改进版

### 视频播放器Video player

**mpv**   phonon-qt6-mpv

vlc

### 图片查看器Image viewer

**gwenview**	#KDE-plasma desktop

swayimg

### 输入法

**fcitx5**

**fcitx5-chinese-addons**

### 邮件客户端Email cilent

**neomutt**

### 词典

**dictd**

### 笔记noto

**siyuan**

### 文件备份

**rsync**

### 种子/磁力链接下载器

**qbittorrent**  
qbittorrent-nox		#无gui

transmission-cli	#CLI tools, daemon and web client  
transmission-gtk	#GTK GUI  
transmission-qt		#Qt GUI  
transmission-remote-gtk	#GTK remote control for the Transmission BitTorrent client

### 字体font

fontconfig

fontforge

birdfont

### 开发工具

#### dotnet

#### Java

#### python

### 其他

**filelight**		#disk占用饼状显示

**ark**		#归档查看器

**geogebra**	#图形计算器

wine		#Windows兼容层

fastfetch

pacman-contrib	#Contributed scripts and tools for pacman systems;pactree查看依赖树

rclone		#simple WebDAV

pkgstats	#将您系统上安装的软件包列表以及您使用的体系架构和镜像发送给 Arch Linux 开发人员，以帮助他们确定工作的优先顺序，使发行版变得更好

yt-dlp		#命令行视频下载工具

fprintd		#管理指纹识别设备的守护进程

gunpg

grep		#Global Regular Expression Print,文本搜索工具

sed		#Stream EDitor，流编辑器,命令行文本处理工具;文本流的查找、替换、插入、删除等编辑操作。

awk		#文本处理和数据提取

krita

mkcat		#命令行下预览markdown文件

# KDE-plasma中文环境配置

sddm

firefox-i18n-zh-cn	#firefox中文包

# 软件包安装&配置

## fcitx5

**fcitx5-im**	#包组,包含fcitx5 fcitx5-configtool fcitx5-gtk fcitx5-qt

- **fcitx5**	#仅提供基本框架，且仅支持英文。如果要输入其他语言（例如中文或日文），则需要安装输入法引擎（IME）。

- **fcitx5-configtool**

- **fcitx5-qt**

- **fcitx5-gtk**  
  Qt 应用必须通过 fcitx5-qt才能正常使用输入法(如 KDE 软件、QQ Linux 版)  
  GTK 应用必须通过 fcitx5-gtk才能正常输入(如 GNOME 软件、Chrome、Electron 应用)

**fcitx5-chinese-addons**	#包含与中文相关的 addon，例如拼音、双拼和五笔。

```bash
pacman -S fcitx5-im fcitx5-chinese-addons
```

**启用fcitx5**

Start fcitx5 by go to "System settings" -> "Virtual keyboard" -> Select Fcitx 5

**配置拼音输入法**

```bash
fcitx5-configtool
#打开图形配置界面
#也可在System Settings中的Input Method打开
#必须安装fcitx5-configtool
```

bash中输入fcitx5-configtool进入Input Method -> Add Input Method (将Pinyin Add进去再apply)

快捷键

- 切换全角标点/半角标点:Ctrl+.
- 切换Simplified Chinese和Tranditional Chinese:Ctrl+Shift+F

**配置文件	~./config/fcitx5/config**

**Pinyin词库**

- /usr/share/fcitx5/pinyin/dictionaries/ (系统级，全局生效，不建议修改)
- \~/.local/share/fcitx5/pinyin/dictionaries/ (用户级，优先级更高，推荐在此修改或添加)
- 用户自己添加或输入法学习到的词汇默认保存在~/.local/share/fcitx5/pinyin/下
- 词库文件类型：  
  .dict: 主词库文件(二进制文件)  
  libime 包提供了命令行工具 ime-dict 用于管理词库（转换格式、编译等）
- 图形界面导入dictionary:进入Pinyin输入配置 -> Manage Dictionaries

fcitx5-pinyin-zhwiki	//extra//Fcitx 5 Pinyin Dictionary from zh.wikipedia.org

fcitx5-pinyin-moegirl	//archlinuxcn//Fcitx 5 Pinyin Dictionary from zh.moegirl.org.cn

**全局配置**

bash中输入fcitx5-configtool进入Input Method -> Configure global options (Hotkey中可设置Trigger Input Method切换输入法的热键)

**Pinyin输入配置**

bash中输入fcitx5-configtool进入Input Method -> Configure addons -> (Input Method)Pinyin (Configure)

或者找到Input Method下的Pinyin 找到右侧的Configure图标

**外观设置**

fcitx5-breeze	#Fcitx5 theme to match KDE's Breeze style,extra可选

fcitx5-material-color	#提供了类似微软拼音的外观

更多主题在AUR上搜索fcitx5-skin(其中多数已无人维护，可以自己制作)

设置主题:bash中输入fcitx5-configtool进入Input Method -> Configure addons -> (UI)Classic User Interface ->Theme/Dark Theme(默认是Default和Default Dark)

设置字体:上面(UI)Classic User Interface -> Font(Noto Serif Medium 12)

**疑难杂症**

fcitx5-diagnose 会列出所有 Fcitx 5 正常运行所需的前提条件

尝试重启fcitx5解决各种问题`fcitx5 -rd`​

## Steam安装&配置

```bash
pacman -S steam #steam位于mutilib中

#vulkan-driver (nvidia-utils, vulkan-intel, vulkan-radeon, amdvlk, vulkan-swrast, vulkan-virtio, vulkan-nouveau, vulkan-gfxstream, vulkan-dzn)
#lib32-vulkan-driver (lib32-nvidia-utils, lib32-vulkan-intel, lib32-vulkan-radeon, lib32-amdvlk, lib32-vulkan-virtio, lib32-vulkan-swrast, lib32-vulkan-nouveau, lib32-vulkan-gfxstream, lib32-vulkan-dzn)
#ttf-font (ttf-bitstream-vera, gnu-free-fonts, noto-fonts, ttf-croscore, ttf-dejavu, ttf-droid, ttf-ibm-plex, ttf-input, ttf-liberation, ttf-roboto, ttf-input-nerd)
#xdg-desktop-portal-impl (xdg-desktop-portal-gtk, xdg-desktop-portal-kde, xdg-desktop-portal-gnome, xdg-desktop-portal-hyprland, xdg-desktop-portal-lxqt, xdg-desktop-portal-wlr, xdg-desktop-portal-xapp, xdg-desktop-portal-dde, xdg-desktop-portal-cosmic, xdg-desktop-portal-kde) (optional)
```

启用Proton

settings -> Compatibility -> Enable*

关注Proton

settings -> Interface -> Enable context menu focus compatibility mode

24小时制

settings -> Interface -> 24-hour clock

选择从Library打开steam

settings -> Interface -> Start Up Location

屏幕录制

settings ->  Game Recording -> Record Manually

recoding:Ctrl+F11

screenshot:F12

大屏幕模式

settings -> Interface -> Start Steam in Big Picture Mode

禁用着色器预缓存

settings -> Downloads -> Enable Shader Pre-caching

取消促销邮件推送

settings -> Interface -> Disable(Notify me about additions or changes to my games,new releases,and upcoming releases)?????

settings -> Notifications ->(disable)An item on my wishlist is on sale

settings -> Notifications ->(disable)There's a major sale

在库中显示Steam Deck兼容性信息

settings -> Library ->(enable)Show Steam Deck compatibility information in library

网页浏览器搜索引擎

settings -> In Game -> Web brower home page

## FireFox配置

登录login in 

修改搜素引擎

settings -> Search -> Default Search Engine -> Bing

启用自动播放

settings -> Privacy & Security -> Permissions -> Autoplay (Allow Audio and Video)

自定义工具栏

右键搜索框右侧空白处 -> Customizm Toolbar(History,Downloads,Extensions,Bookmarks menu)

自动恢复上次关闭的窗口和标签页

settings -> General -> Startup -> enable(Open previous windows and tabs)

插件:BookmarkHub(用于在多个浏览器之间同步书签)

## Visual Studio Code

微软开发的跨平台文本编辑器，基于 Electron 框架构建，并且极具扩展性。可以在编辑器自带的应用商店，或者从 https://marketplace.visualstudio.com/VSCode 中安装扩展。

### 安装

- **Code - OSS** — Arch Linux 官方开源版本。配置有[Open VSX](https://open-vsx.org/)。

[https://github.com/microsoft/vscode](https://github.com/microsoft/vscode) || [code](https://archlinux.org/packages/?name=code)​<sup>包</sup>

- **Visual Studio Code** — 微软官方版本，专有软件。

[https://code.visualstudio.com/](https://code.visualstudio.com/) || [visual-studio-code-bin](https://aur.archlinux.org/packages/visual-studio-code-bin/)​<sup>AUR</sup>

- **VSCodium** — 社区驱动的完全开源的 VSCode 版本,不带微软附属和遥测功能[[1]](https://github.com/VSCodium/vscodium/issues/267#issuecomment-542462446), 同时启用了Open VSX。

[https://vscodium.com/](https://vscodium.com/) || [vscodium](https://aur.archlinux.org/packages/vscodium/)​<sup>AUR</sup>

其他可用版本：

- [code-git](https://aur.archlinux.org/packages/code-git/)​<sup>AUR</sup>(开发中的最新开源版本)
- [visual-studio-code-insiders-bin](https://aur.archlinux.org/packages/visual-studio-code-insiders-bin/)​<sup>AUR</sup>(微软官方版本,每日更新)
- [vscodium-bin](https://aur.archlinux.org/packages/vscodium-bin/)​<sup>AUR</sup>(社区驱动的完全开源的 VSCode 版本,不带微软附属和遥测功能,二进制包)
- [vscodium-git](https://aur.archlinux.org/packages/vscodium-git/)​<sup>AUR</sup> (社区驱动的完全开源的 VSCode 版本,不带微软附属和遥测功能,最新的开发版)

这些不同的版本都是基于[Code - OSS](https://github.com/VSCodium/vscodium/blob/master/README.md)构建的, 但具有不同的许可证和默认配置。值得注意的是，只有专有版本被允许使用官方拓展市场并使用微软的专有扩展，例如[OmniSharp C# Debugger](https://github.com/OmniSharp/omnisharp-vscode/blob/master/debugger.md)。后者通过握手机制进行验证，并不能被绕过。有关开源和专有 "Visual Studio Code "构建之间差异的更多信息，请查阅[Code - OSS GitHub wiki](https://github.com/microsoft/vscode/wiki/Differences-between-the-repository-and-Visual-Studio-Code).

---

### 配置

Theme

在左下角找到settings点击，界面右上角点Open Settings(JSON)

settings.json添加一行

"workbench.tree.indent":23,

### 配置C#开发环境

**安装 .NET SDK**

```bash
pacman -S dotnet-sdk
#最新的sdk,暂时是9.0，会自动解决依赖

#dotnet主要组成部分
dotnet-sdk
dotnet-runtime
dotnet-targeting-pack 
#dotnet Command Line Interface
dotnet-host

#Extra仓库支持
dotnet-sdk-6.0  dotnet-runtime-6.0  dotnet-targeting-pack-6.0
dotnet-sdk-7.0  dotnet-runtime-7.0  dotnet-targeting-pack-7.0
dotnet-sdk-8.0  dotnet-runtime-8.0  dotnet-targeting-pack-8.0
```

**必装扩展**：

- ​`C#` (由 Microsoft 提供) - 核心语言支持
- ​`C# Dev Kit` (Microsoft) - 高级开发工具包
- ​`NuGet Package Manager` - 依赖管理

# 参考资料

https://wiki.archlinux.org/		#archlinux wiki

https://wiki.archlinuxcn.org/		#archlinux wiki(中文)

https://space.bilibili.com/34569411	#bilibili up主:unixchad

https://arch.icekylin.online/		#archlinux简明指南

https://mirrors.tuna.tsinghua.edu.cn/	#清华大学开源软件镜像站

...(仅列举部分)
