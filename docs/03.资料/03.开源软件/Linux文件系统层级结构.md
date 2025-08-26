# Linux文件系统层级结构

# GNU/Linux 文件系统层级结构 (FHS)

FHS 是一个定义了 Linux 操作系统中文档、目录和程序应该位于何处的标准。它的主要目的是确保软件和用户都能预测文件的位置，无论运行的是哪个 Linux 发行版。

**根目录概览**

/  
├── boot  
│   ├── EFI  
│   ├── grub  
│   ├── amd-ucode.img  
│   ├── initramfs-linux-fallback.img  
│   ├── initramfs-linux.img  
│   └── vmlinuz-linux  
├── usr  
│   ├── bin  
│   ├── sbin -> bin  
│   ├── lib  
│   ├── lib64 -> lib  
│   ├── lib32  
│   ├── local  
│   ├── include  
│   ├── share  
│   └── src  
├── opt  
├── etc  
├── home  
│   └── Remilia  
├── root  
├── mnt  
├── var  
│   ├── cache  
│   ├── db  
│   ├── empty  
│   ├── games  
│   ├── lib  
│   ├── local  
│   ├── lock -> /run/lock  
│   ├── log  
│   ├── mail -> spool/mail  
│   ├── opt  
│   ├── run -> /run  
│   ├── spool  
│   └── tmp  
├── srv  
├── dev  
├── sys  
├── proc  
├── run  
├── tmp  
├── lib64 -> usr/lib  
├── lib -> usr/lib  
├── sbin -> usr/bin  
└── bin -> usr/bin

历史遗留问题+兼容性考虑:根目录下的bin,sbin目录分布软链接到/usr/bin和/usr/sbin  
原本bin目录用于存放对所有用户都可执行的文件,sbin目录用于存放root用户可执行的文件  
较为激进且主要面向单用户的发行版Fedora和ArchLinux还将/usr/bin和/usr/sbin进行了合并,最终结果如下

- /bin -> /usr/bin
- /sbin -> /usr/bin
- /usr/sbin -> /usr/sbin

历史遗留问题+兼容性考虑:其余lib,lib64目录软链接到/usr/lib

- /lib -> /usr/lib
- /lib64 -> usr/lib
- /usr/lib64 -> /usr/lib

**根目录下各文件夹详细介绍**

- /boot            存放操作系统内核,启动引导器;(多系统通常共用)
- /usr  [Unix System Resource]

  - /usr/bin     可执行文件(包括二进制文件(和CPU架构强相关)和脚本文件)
  - /usr/lib     64位库文件
  - /usr/lib32   32位库文件
  - /usr/local   系统管理员手动编译安装的软件
  - /usr/include C/C++头文件
  - /usr/src     源代码
  - /usr/share   非代码资源,许多软件会在这里创建自己的子目录来存放资源

    - /usr/share/man  手册默认存放位置
    - /usr/share/doc  软件的详细文档、FAQ、示例配置文件、版权信息
    - /usr/share/info     GNU Info 系统文件
    - /usr/share/licenses  Application licenses
    - /usr/share/fonts  系统全局字体
    - /usr/share/icons   系统全局图标
    - /usr/share/pixmaps 系统全局图标
    - /usr/share/applications 存放.desktop 文件(这些文件定义了如何在图形化菜单中显示应用程序的启动器)
    - /usr/share/themes  桌面主题和窗口管理器主题
    - /usr/share/sounds  系统音效(如提示音、通知声)
    - /usr/share/wallpapers 系统自带的桌面壁纸
    - /usr/share/mime     MIME 类型数据库,定义文件类型及其关联的应用程序
- /opt  [option]   可选的额外软件(如大型商业软件)
- /etc  [et cetera]系统级配置文件
- /home            普通用户家目录文件夹
- /root            root用户家目录
- /mnt  [mount]    挂载点(手动在此目录下创建子目录，用于挂载硬盘分区或网络共享等)
- /var  [variable] 日志、缓存等可变数据

  - /var/cache 应用程序缓存数据(可再生,主要用于提高性能)
  - /var/log   日志文件
  - /var/lib   应用程序状态信息
  - /var/spool 任务队列数据
  - /var/tmp   在多次重启之间保留的临时文件
- /srv  [service]  本机作为服务器,由系统提供服务的数据
- /dev  [device]   设备文件                   (Virtual Filesystem)
- /sys  [system]   硬件设备、驱动、内核参数的接口 (Virtual Filesystem)
- /proc [process]  内核和进程信息              (Virtual Filesystem)
- /run             进程运行时数据              (临时内存文件系统tmpfs)
- /tmp  [temporary]临时文件                   (临时内存文件系统tmpfs)

注:/tmp和/var/tmp文件夹权限drwxrwxrwt:任何用户都可读写,但只能删除自己创建的文件

**文件系统层级和磁盘分区的对应关系(示例)**

NAME          SIZE TYPE MOUNTPOINTS  
nvme0n1       1.9T disk  
├─nvme0n1p1     1G part /boot  
├─nvme0n1p4   1.3T part /mnt/Data  
├─nvme0n1p5   400G part /  
└─nvme0n1p6    16G part [SWAP]

# **XDG 基本目录规范**

**freedesktop.org**制定XDG 基本目录规范,提供一个标准化的、有组织的方式来存储用户特定的数据。

背景:随着桌面环境的发展，用户家目录 (\~/) 变得非常混乱，充满了数以百计的以点号 (.) 开头的“隐藏”目录（如 .config, .vim, .cache），这些是应用程序存储其设置和数据的目录。这种混乱被称为“点文件瘟疫”（Dotfile Clutter）。

核心思想: 将用户文件按用途（配置、数据、缓存等）进行分类，并通过环境变量来指定这些文件的位置。

**默认值**

XDG_DATA_HOME	$HOME/.local/share

XDG_CONFIG_HOME	$HOME/.config

XDG_CACHE_HOME	$HOME/.cache

XDG_STATE_HOME	$HOME/.local/state

XDG_DATA_DIRS	/usr/local/share/:/usr/share/

XDG_CONFIG_DIRS /etc/xdg

XDG_RUNTIME_DIR /run/user

**实际例子** (env | grep XDG)

XDG_CONFIG_DIRS=/home/Remilia/.config/kdedefaults:/etc/xdg  
XDG_SESSION_PATH=/org/freedesktop/DisplayManager/Session1  
XDG_MENU_PREFIX=plasma-  
XDG_SEAT=seat0  
XDG_SESSION_DESKTOP=KDE  
XDG_SESSION_TYPE=wayland  
XDG_CURRENT_DESKTOP=KDE  
XDG_SEAT_PATH=/org/freedesktop/DisplayManager/Seat0  
XDG_SESSION_CLASS=user  
XDG_VTNR=1  
XDG_SESSION_ID=2  
XDG_RUNTIME_DIR=/run/user/1000  
XDG_DATA_DIRS=/home/Remilia/.local/share/flatpak/exports/share:/var/lib/flatpak/exports/share:/usr/local/share:/usr/share
