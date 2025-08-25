# Pacman

# 常用命令

pacman主要有三类大写参数，并配合小写参数一起使用  
主要软件仓库core extra multilib archlinuxcn[第三方仓库]  
镜像列表/etc/pacman.d/mirrorlist  
配置文件/etc/pacman.conf  
缓存安装包和签名/var/cache/pacman(archlinux安装后的安装包不会删除)  
安装包和仓库信息/var/lib/pacman  
日志/var/log/pacman.log  
通用参数  
-h	帮助  
 **-S**	synchronize同步  
-y	同步最新软件列表  
-yy	强行更新软件列表  
-u	update更新软件  
-s	(后接字符串，模糊匹配)search查询软件(如pacman -Ss vim会在仓库里查询含有vim的包)  
-c	删除缓存的安装包  
-l	后接软件仓库,列出该软件仓库所有包  
-g	查看包组里有哪些软件包(-gg to view all groups and members)  
 **-R**	remove删除(不加参数只删除此包)  
-s	删除所有只有该软件包需要的依赖(且依赖是安装该软件包附带的而非自己手动安装),不删除与别的软件包共用的依赖  
-n	删全局配置,而不删除个人配置  
 **-Q**	query查询本地软件包  
-i	显示所有安装在本地的软件包的详细信息  
-e	显示所有自己安装的软件包  
-q	不显示版本号等,只显示包名  
-s	(后接字符串，模糊匹配)查询本地安装的软件  
-l	列出已安装软件包的所有文件  
(注:在安装更新卸载后可能产生一些不再被依赖的软件)  
-dt	查询不在需要的依赖  
-o	后接(二进制文件)(o\=own)看哪个包拥有其二进制文件  
删除这些的小技巧sudo pacman -R \$(pacman -Qdtq)  
 **-F**	files操作文件数据库  
-y	同步文件数据库（必需步骤）  
-l	列出软件包所有文件  
-s	(后接字符串，模糊匹配)查询本地文件所属

同步文件数据库(从镜像源下载最新的 files.db 数据库,包含所有软件包的文件列表)  
pacman -Fy

字体软件包查询  
pacman -Qq | grep -i -E 'font|ttf|otf|adobe|typeface|noto|awesome|nerd|serif|sans|wqy|ttc'

列出已安装软件包的所有文件  
pacman -Ql <package-name>  
查看未安装软件包的文件列表  
pacman -Fl <package-name>

**仅查询已安装包**中文件所属关系  
pacman -Qo <package-name>  
**查询所有仓库**中的文件所属关系  
pacman -F <file-name>

# 详细参数

```bash
[Remilia@ArchLinux-Remilia ~]$ pacman -h
usage:  pacman <operation> [...]
operations:
    pacman {-h --help}
    pacman {-V --version}
    pacman {-D --database} <options> <package(s)>
    pacman {-F --files}    [options] [file(s)]
    pacman {-Q --query}    [options] [package(s)]
    pacman {-R --remove}   [options] <package(s)>
    pacman {-S --sync}     [options] [package(s)]
    pacman {-T --deptest}  [options] [package(s)]
    pacman {-U --upgrade}  [options] <file(s)>
```

```bash
[Remilia@ArchLinux-Remilia ~]$ pacman -Dh
usage:  pacman {-D --database} <options> <package(s)>
options:
  -b, --dbpath <path>  set an alternate database location
  -k, --check          test local database for validity (-kk for sync databases)
  -q, --quiet          suppress output of success messages
  -r, --root <path>    set an alternate installation root
  -v, --verbose        be verbose
      --arch <arch>    set an alternate architecture
      --asdeps         mark packages as non-explicitly installed
      --asexplicit     mark packages as explicitly installed
      --cachedir <dir> set an alternate package cache location
      --color <when>   colorize the output
      --config <path>  set an alternate configuration file
      --confirm        always ask for confirmation
      --debug          display debug messages
      --disable-download-timeout
                       use relaxed timeouts for download
      --disable-sandbox
                       disable the sandbox used for the downloader process
      --gpgdir <path>  set an alternate home directory for GnuPG
      --hookdir <dir>  set an alternate hook location
      --logfile <path> set an alternate log file
      --noconfirm      do not ask for any confirmation
      --sysroot        operate on a mounted guest system (root-only)
```

```bash
[Remilia@ArchLinux-Remilia ~]$ pacman -Fh
usage:  pacman {-F --files} [options] [file(s)]
options:
  -b, --dbpath <path>  set an alternate database location
  -l, --list           list the files owned by the queried package
  -q, --quiet          show less information for query and search
  -r, --root <path>    set an alternate installation root
  -v, --verbose        be verbose
  -x, --regex          enable searching using regular expressions
  -y, --refresh        download fresh package databases from the server
                       (-yy to force a refresh even if up to date)
      --arch <arch>    set an alternate architecture
      --cachedir <dir> set an alternate package cache location
      --color <when>   colorize the output
      --config <path>  set an alternate configuration file
      --confirm        always ask for confirmation
      --debug          display debug messages
      --disable-download-timeout
                       use relaxed timeouts for download
      --disable-sandbox
                       disable the sandbox used for the downloader process
      --gpgdir <path>  set an alternate home directory for GnuPG
      --hookdir <dir>  set an alternate hook location
      --logfile <path> set an alternate log file
      --machinereadable
                       produce machine-readable output
      --noconfirm      do not ask for any confirmation
      --sysroot        operate on a mounted guest system (root-only)
```

```bash
[Remilia@ArchLinux-Remilia ~]$ pacman -Qh
usage:  pacman {-Q --query} [options] [package(s)]
options:
  -b, --dbpath <path>  set an alternate database location
  -c, --changelog      view the changelog of a package
  -d, --deps           list packages installed as dependencies [filter]
  -e, --explicit       list packages explicitly installed [filter]
  -g, --groups         view all members of a package group
  -i, --info           view package information (-ii for backup files)
  -k, --check          check that package files exist (-kk for file properties)
  -l, --list           list the files owned by the queried package
  -m, --foreign        list installed packages not found in sync db(s) [filter]
  -n, --native         list installed packages only found in sync db(s) [filter]
  -o, --owns <file>    query the package that owns <file>
  -p, --file <package> query a package file instead of the database
  -q, --quiet          show less information for query and search
  -r, --root <path>    set an alternate installation root
  -s, --search <regex> search locally-installed packages for matching strings
  -t, --unrequired     list packages not (optionally) required by any
                       package (-tt to ignore optdepends) [filter]
  -u, --upgrades       list outdated packages [filter]
  -v, --verbose        be verbose
      --arch <arch>    set an alternate architecture
      --cachedir <dir> set an alternate package cache location
      --color <when>   colorize the output
      --config <path>  set an alternate configuration file
      --confirm        always ask for confirmation
      --debug          display debug messages
      --disable-download-timeout
                       use relaxed timeouts for download
      --disable-sandbox
                       disable the sandbox used for the downloader process
      --gpgdir <path>  set an alternate home directory for GnuPG
      --hookdir <dir>  set an alternate hook location
      --logfile <path> set an alternate log file
      --noconfirm      do not ask for any confirmation
      --sysroot        operate on a mounted guest system (root-only)
```

```bash
[Remilia@ArchLinux-Remilia ~]$ pacman -Rh
usage:  pacman {-R --remove} [options] <package(s)>
options:
  -b, --dbpath <path>  set an alternate database location
  -c, --cascade        remove packages and all packages that depend on them
  -d, --nodeps         skip dependency version checks (-dd to skip all checks)
  -n, --nosave         remove configuration files
  -p, --print          print the targets instead of performing the operation
  -r, --root <path>    set an alternate installation root
  -s, --recursive      remove unnecessary dependencies
                       (-ss includes explicitly installed dependencies)
  -u, --unneeded       remove unneeded packages
  -v, --verbose        be verbose
      --arch <arch>    set an alternate architecture
      --assume-installed <package=version>
                       add a virtual package to satisfy dependencies
      --cachedir <dir> set an alternate package cache location
      --color <when>   colorize the output
      --config <path>  set an alternate configuration file
      --confirm        always ask for confirmation
      --dbonly         only modify database entries, not package files
      --debug          display debug messages
      --disable-download-timeout
                       use relaxed timeouts for download
      --disable-sandbox
                       disable the sandbox used for the downloader process
      --gpgdir <path>  set an alternate home directory for GnuPG
      --hookdir <dir>  set an alternate hook location
      --logfile <path> set an alternate log file
      --noconfirm      do not ask for any confirmation
      --noprogressbar  do not show a progress bar when downloading files
      --noscriptlet    do not execute the install scriptlet if one exists
      --print-format <string>
                       specify how the targets should be printed
      --sysroot        operate on a mounted guest system (root-only)
```

```bash
[Remilia@ArchLinux-Remilia ~]$ pacman -Sh
usage:  pacman {-S --sync} [options] [package(s)]
options:
  -b, --dbpath <path>  set an alternate database location
  -c, --clean          remove old packages from cache directory (-cc for all)
  -d, --nodeps         skip dependency version checks (-dd to skip all checks)
  -g, --groups         view all members of a package group
                       (-gg to view all groups and members)
  -i, --info           view package information (-ii for extended information)
  -l, --list <repo>    view a list of packages in a repo
  -p, --print          print the targets instead of performing the operation
  -q, --quiet          show less information for query and search
  -r, --root <path>    set an alternate installation root
  -s, --search <regex> search remote repositories for matching strings
  -u, --sysupgrade     upgrade installed packages (-uu enables downgrades)
  -v, --verbose        be verbose
  -w, --downloadonly   download packages but do not install/upgrade anything
  -y, --refresh        download fresh package databases from the server
                       (-yy to force a refresh even if up to date)
      --arch <arch>    set an alternate architecture
      --asdeps         install packages as non-explicitly installed
      --asexplicit     install packages as explicitly installed
      --assume-installed <package=version>
                       add a virtual package to satisfy dependencies
      --cachedir <dir> set an alternate package cache location
      --color <when>   colorize the output
      --config <path>  set an alternate configuration file
      --confirm        always ask for confirmation
      --dbonly         only modify database entries, not package files
      --debug          display debug messages
      --disable-download-timeout
                       use relaxed timeouts for download
      --disable-sandbox
                       disable the sandbox used for the downloader process
      --gpgdir <path>  set an alternate home directory for GnuPG
      --hookdir <dir>  set an alternate hook location
      --ignore <pkg>   ignore a package upgrade (can be used more than once)
      --ignoregroup <grp>
                       ignore a group upgrade (can be used more than once)
      --logfile <path> set an alternate log file
      --needed         do not reinstall up to date packages
      --noconfirm      do not ask for any confirmation
      --noprogressbar  do not show a progress bar when downloading files
      --noscriptlet    do not execute the install scriptlet if one exists
      --overwrite <glob>
                       overwrite conflicting files (can be used more than once)
      --print-format <string>
                       specify how the targets should be printed
      --sysroot        operate on a mounted guest system (root-only)
```

```bash
[Remilia@ArchLinux-Remilia ~]$ pacman -Th
usage:  pacman {-T --deptest} [options] [package(s)]
options:
  -b, --dbpath <path>  set an alternate database location
  -r, --root <path>    set an alternate installation root
  -v, --verbose        be verbose
      --arch <arch>    set an alternate architecture
      --cachedir <dir> set an alternate package cache location
      --color <when>   colorize the output
      --config <path>  set an alternate configuration file
      --confirm        always ask for confirmation
      --debug          display debug messages
      --disable-download-timeout
                       use relaxed timeouts for download
      --disable-sandbox
                       disable the sandbox used for the downloader process
      --gpgdir <path>  set an alternate home directory for GnuPG
      --hookdir <dir>  set an alternate hook location
      --logfile <path> set an alternate log file
      --noconfirm      do not ask for any confirmation
      --sysroot        operate on a mounted guest system (root-only)
```

```bash
[Remilia@ArchLinux-Remilia ~]$ pacman -Uh
usage:  pacman {-U --upgrade} [options] <file(s)>
options:
  -b, --dbpath <path>  set an alternate database location
  -d, --nodeps         skip dependency version checks (-dd to skip all checks)
  -p, --print          print the targets instead of performing the operation
  -r, --root <path>    set an alternate installation root
  -v, --verbose        be verbose
  -w, --downloadonly   download packages but do not install/upgrade anything
      --arch <arch>    set an alternate architecture
      --asdeps         install packages as non-explicitly installed
      --asexplicit     install packages as explicitly installed
      --assume-installed <package=version>
                       add a virtual package to satisfy dependencies
      --cachedir <dir> set an alternate package cache location
      --color <when>   colorize the output
      --config <path>  set an alternate configuration file
      --confirm        always ask for confirmation
      --dbonly         only modify database entries, not package files
      --debug          display debug messages
      --disable-download-timeout
                       use relaxed timeouts for download
      --disable-sandbox
                       disable the sandbox used for the downloader process
      --gpgdir <path>  set an alternate home directory for GnuPG
      --hookdir <dir>  set an alternate hook location
      --ignore <pkg>   ignore a package upgrade (can be used more than once)
      --ignoregroup <grp>
                       ignore a group upgrade (can be used more than once)
      --logfile <path> set an alternate log file
      --needed         do not reinstall up to date packages
      --noconfirm      do not ask for any confirmation
      --noprogressbar  do not show a progress bar when downloading files
      --noscriptlet    do not execute the install scriptlet if one exists
      --overwrite <glob>
                       overwrite conflicting files (can be used more than once)
      --print-format <string>
                       specify how the targets should be printed
      --sysroot        operate on a mounted guest system (root-only)
```

# 参考资料

非官方用户仓库:

https://wiki.archlinuxcn.org/wiki/%E9%9D%9E%E5%AE%98%E6%96%B9%E7%94%A8%E6%88%B7%E4%BB%93%E5%BA%93

Arch Linux 中文社区仓库:

https://wiki.archlinuxcn.org/wiki/Arch_Linux_%E4%B8%AD%E6%96%87%E7%A4%BE%E5%8C%BA%E4%BB%93%E5%BA%93

AUR (ArchLinux User Repository):

https://aur.archlinux.org/

# makepkg

/usr/bin/makepkg是pacman软件包下的,基于PKGBUILD文件用于打包archlinux软件包的bash脚本

**常用参数**

- -i,--install  Install package after successful build (pacman -U package_name-version-architecture.pkg.tar.zst)
- -s,--syncdeps  Install missing dependencies with pacman

- -r,--rmdeps  Remove installed dependencies after a successful build
- -c,--clean   Clean up work files after build(通常要和-f配合)
- -f, --force  Overwrite existing package

使用 makepkg 构建软件包时，makepkg 会自动执行如下功能:

- 检查软件包的**依赖**和**构建依赖**是否已安装
- 从服务器中**下载源文件**
- **校验**源文件的完整性
- **解压**源文件
- 打上必要的**补丁（patch）**
- **构建**软件并安装到 fake root
- 从可执行文件中**去掉**符号标记
- 从库文件中**去掉**调试标记
- **压缩**手册页和/或 info 页
- 生成**包信息文件**（包含软件包的基本信息）
- **压缩** fake root 成为软件包文件（\*.pkg.tar.xz）
- 生成的软件包文件**保存**在指定的目录中（默认在当前目录）

# PKGBUILD

PKGBUILD 是 Arch Linux 及其衍生发行版（如 Manjaro）中用于构建软件包的核心脚本文件。它本质上是一个 Bash 脚本，包含构建软件包所需的所有元数据和指令。

## Fields

### 自定义变量 Costom variables

The mandatory fields:**pkgname**,**pkgver**,**pkgrel**,**arch**

#### **pkgname (array)**

Either the name of the package or an array of names for split packages. Valid characters for members of this array are alphanumerics, and any of the following characters: “@ . \_ + -”. Additionally, names are not allowed to start with hyphens or dots.

软件包的名称（必需）

#### **pkgver**

The version of the software as released from the author (e.g., *2.7.1*). The variable is not allowed to contain colons, forward slashes, hyphens or whitespace.The pkgver variable can be automatically updated by providing a pkgver() function in the PKGBUILD that outputs the new package version. This is run after downloading and extracting the sources and running the prepare() function (if present), so it can use those files in determining the new pkgver. This is most useful when used with sources from version control systems (see below).

软件包的版本（必需）。

pkgver():(可选)用于在构建过程中**动态更新** `$pkgver` 变量的函数。常见于从 VCS（如 Git）构建时自动获取最新提交信息作为版本号的一部分。**必须输出新的版本号到标准输出(stdout)** 。

#### **pkgrel**

This is the release number specific to the distribution. This allows package maintainers to make updates to the package’s configure flags, for example. This is typically set to *1* for each new upstream software release and incremented for intermediate PKGBUILD updates. The variable is a positive integer, with an optional subrelease level specified by adding another positive integer separated by a period (i.e. in the form x.y).

Arch Linux 打包的修订版本号，用于区分同一上游版本的不同打包（必需，通常以 `1` 开始）。

#### **epoch**

Used to force the package to be seen as newer than any previous versions with a lower epoch, even if the version number would normally not trigger such an upgrade. This value is required to be a positive integer; the default value if left unspecified is *0*. This is useful when the version numbering scheme of a package changes (or is alphanumeric), breaking normal version comparison logic. See [pacman(8)](https://man.archlinux.org/man/pacman.8.en) for more information on version comparisons.

#### **pkgdesc**

This should be a brief description of the package and its functionality. Try to keep the description to one line of text and to not use the package’s name.

对软件包的简短描述（必需）。

#### **url**

This field contains a URL that is associated with the software being packaged. This is typically the project’s web site.

软件项目主页的 URL（通常必需）。

#### **license (array)**

This field specifies the license(s) that apply to the package. If multiple licenses are applicable, list all of them: license\=('GPL' 'FDL').

软件包的许可证类型（必需，如 `license=('GPL')`）。

#### **install**

Specifies a special install script that is to be included in the package. This file should reside in the same directory as the PKGBUILD and will be copied into the package by makepkg. It does not need to be included in the source array (e.g., install\=\$pkgname.install).

#### **changelog**

Specifies a changelog file that is to be included in the package. The changelog file should end in a single newline. This file should reside in the same directory as the PKGBUILD and will be copied into the package by makepkg. It does not need to be included in the source array (e.g., changelog\=\$pkgname.changelog).

#### **source (array)**

An array of source files required to build the package. Source files must either reside in the same directory as the PKGBUILD, or be a fully-qualified URL that makepkg can use to download the file. To simplify the maintenance of PKGBUILDs, use the \$pkgname and \$pkgver variables when specifying the download location, if possible. Compressed files will be extracted automatically unless found in the noextract array described below.Additional architecture-specific sources can be added by appending an underscore and the architecture name e.g., *source_x86_64=()* . There must be a corresponding integrity array with checksums, e.g.*cksums_x86_64=()* .

It is also possible to change the name of the downloaded file, which is helpful with weird URLs and for handling multiple source files with the same name. The syntax is: source\=('filename::url').

makepkg also supports building developmental versions of packages using sources downloaded from version control systems (VCS). For more information, see Using VCS Sources below.

Files in the source array with extensions .sig, .sign or, .asc are recognized by makepkg as PGP signatures and will be automatically used to verify the integrity of the corresponding source file.

构建软件包所需的源代码文件或其他文件的 URL 列表（数组）（必需）。可以是远程 URL（`http://`, `https://`, `ftp://`, `git://` 等）或本地文件名。支持使用 `pkgname` 和 `pkgver` 等变量的占位符（如 `$pkgname-$pkgver.tar.gz`）。

#### **validpgpkeys (array)**

An array of PGP fingerprints. If this array is non-empty, makepkg will only accept signatures from the keys listed here and will ignore the trust values from the keyring. If the source file was signed with a subkey, makepkg will still use the primary key for comparison.Only full fingerprints are accepted. They must be uppercase and must not contain whitespace characters.

#### **noextract (array)**

An array of file names corresponding to those from the source array. Files listed here will not be extracted with the rest of the source files. This is useful for packages that use compressed data directly.

如果 `source` 数组中的某些文件（如 `.zip`）**不应该**在下载后被自动解压，则在此列出这些文件名（数组）。

#### **cksums (array)**

This array contains CRC checksums for every source file specified in the source array (in the same order). makepkg will use this to verify source file integrity during subsequent builds. If *SKIP* is put in the array in place of a normal hash, the integrity check for that source file will be skipped. To easily generate cksums, run “makepkg -g \>\> PKGBUILD”. If desired, move the cksums line to an appropriate location. Note that checksums generated by "makepkg -g" should be verified using checksum values provided by the software developer.

#### **md5sums, sha1sums, sha224sums, sha256sums, sha384sums, sha512sums, b2sums (arrays)**

Alternative integrity checks that makepkg supports; these all behave similar to the cksums option described above. To enable use and generation of these checksums, be sure to set up the INTEGRITY\_CHECK option in[makepkg.conf(5)](https://man.archlinux.org/man/makepkg.conf.5.en).

用于验证 `source` 文件完整性的校验和数组（必需）。`updpkgsums` 工具可自动生成。**强烈推荐使用** **​`sha256sums`​** **或更高强度的校验和。**

#### **groups (array)**

An array of symbolic names that represent groups of packages, allowing you to install multiple packages by requesting a single target. For example, one could install all KDE packages by installing the*kde* group.

#### **arch (array)**

Defines on which architectures the given package is available (e.g., arch\=('i686' 'x86\_64')). Packages that contain no architecture specific files should use arch\=('any'). Valid characters for members of this array are alphanumerics and “\_”.

软件包可以运行的处理器架构列表（必需，如 `arch=('x86_64')` 或 `arch=('i686' 'x86_64')`）。

#### **backup (array)**

An array of file names, without preceding slashes, that should be backed up if the package is removed or upgraded. This is commonly used for packages placing configuration files in  */etc*. See "Handling Config Files" in [pacman(8)](https://man.archlinux.org/man/pacman.8.en) for more information.

#### **depends (array)**

An array of packages this package depends on to run. Entries in this list should be surrounded with single quotes and contain at least the package name. Entries can also include a version requirement of the form *name&lt;&gt;version*, where \<\> is one of five comparisons: \>\= (greater than or equal to), \<\= (less than or equal to), \= (equal to), \> (greater than), or \< (less than).If the dependency name appears to be a library (ends with .so), makepkg will try to find a binary that depends on the library in the built package and append the version needed by the binary. Appending the version yourself disables automatic detection.

Additional architecture-specific depends can be added by appending an underscore and the architecture name e.g., *depends_x86_64=()* .

软件包**运行**时必需的依赖包列表（数组）。

#### **makedepends (array)**

An array of packages this package depends on to build but are not needed at runtime. Packages in this list follow the same format as depends.Additional architecture-specific makedepends can be added by appending an underscore and the architecture name e.g.,*makedepends_x86_64=()* .

软件包**编译/构建**时必需的依赖包列表（数组），构建完成后就不再需要。

#### **checkdepends (array)**

An array of packages this package depends on to run its test suite but are not needed at runtime. Packages in this list follow the same format as depends. These dependencies are only considered when the check() function is present and is to be run by makepkg.Additional architecture-specific checkdepends can be added by appending an underscore and the architecture name e.g.,*checkdepends_x86_64=()* .

运行测试套件 (`check()`) 时需要的依赖包列表（数组）。

#### **optdepends (array)**

An array of packages (and accompanying reasons) that are not essential for base functionality, but may be necessary to make full use of the contents of this package. optdepends are currently for informational purposes only and are not utilized by pacman during dependency resolution. Packages in this list follow the same format as depends, with an optional description appended. The format for specifying optdepends descriptions is:

```bash
optdepends=('python: for library bindings')
```

Additional architecture-specific optdepends can be added by appending an underscore and the architecture name e.g.,*optdepends_x86_64=()* .

软件包的可选运行时依赖列表（数组），提供额外功能或支持。格式通常为 `optdepends=('包名:功能描述')`​

#### **conflicts (array)**

An array of packages that will conflict with this package (i.e. they cannot both be installed at the same time). This directive follows the same format as depends. Versioned conflicts are supported using the operators as described in depends.Additional architecture-specific conflicts can be added by appending an underscore and the architecture name e.g.,*conflicts_x86_64=()* .

与该软件包冲突（不能同时安装）的其他包列表（数组）。

#### **provides (array)**

An array of “virtual provisions” this package provides. This allows a package to provide dependencies other than its own package name. For example, the dcron package can provide *cron*, which allows packages to depend on *cron* rather than *dcron OR fcron*.Versioned provisions are also possible, in the *name=version*format. For example, dcron can provide *cron=2.0* to satisfy the*cron&gt;=2.0* dependency of other packages. Provisions involving the \> and \< operators are invalid as only specific versions of a package may be provided.

If the provision name appears to be a library (ends with .so), makepkg will try to find the library in the built package and append the correct version. Appending the version yourself disables automatic detection.

Additional architecture-specific provides can be added by appending an underscore and the architecture name e.g.,*provides_x86_64=()* .

该软件包提供的虚拟功能或替代其他包名称的列表（数组）。当其他包依赖这个虚拟功能时，安装此包即可满足。

#### **replaces (array)**

An array of packages this package should replace. This can be used to handle renamed/combined packages. For example, if the*j2re* package is renamed to *jre*, this directive allows future upgrades to continue as expected even though the package has moved. Versioned replaces are supported using the operators as described in depends.Sysupgrade is currently the only pacman operation that utilizes this field. A normal sync or upgrade will not use its value.

Additional architecture-specific replaces can be added by appending an underscore and the architecture name e.g.,*replaces_x86_64=()* .

该软件包替换/取代的旧包列表（数组）。当安装此包时，`pacman` 会尝试移除列表中的旧包。

#### **options (array)**

不重要

### 预定义变量/环境变量 Predefined Variables

All of the above variables such as \$pkgname and \$pkgver are available for use in the packaging functions. In addition, makepkg defines the following variables:

#### **srcdir**

This contains the directory where makepkg extracts, or copies, all source files.

\${srcdir}：存放**原始源代码**（构建前的文件）。

#### **pkgdir**

This contains the directory where makepkg bundles the installed package. This directory will become the root directory of your built package. This variable should only be used in the package() function.

\${pkgdir}：存放**要打包到最终软件包中的文件**（构建后安装的文件）。

#### **startdir**

This contains the absolute path to the directory where the PKGBUILD is located, which is usually the output of \$(pwd) when makepkg is started. Use of this variable is deprecated and strongly discouraged.

### 注

- If you need to create any custom variables for use in your build process, it is recommended to prefix their name with an  *_* (underscore). This will prevent any possible name clashes with internal makepkg variables.  
  例:_pkgname="Siyuan"

## **Functions**

The mandatory functions:**package()**

#### **package() Function**

The package() function is used to install files into the directory that will become the root directory of the built package and is run after all the optional functions listed below. The packaging stage is run using fakeroot to ensure correct file permissions in the resulting package. All other functions will be run as the user calling makepkg. This function is run inside \$srcdir.

包含将**构建好的文件安装到伪根目录（fake root directory）**  中的命令。这个目录（`$pkgdir`）最终会被压缩成实际的软件包（`.pkg.tar.zst`）。核心命令通常是 `make DESTDIR="$pkgdir/" install` 或其等价形式。你需要在此函数中精确地将文件复制到 `$pkgdir` 下的正确路径（如 `$pkgdir/usr/bin`, `$pkgdir/usr/lib`, `$pkgdir/etc` 等）。

#### **verify() Function**

An optional verify() function can be specified to implement arbitrary source authentication. The function should return a non-zero exit code when verification fails. This function is run before sources are extracted. This function is run inside \$startdir.

#### **prepare() Function**

An optional prepare() function can be specified in which operations to prepare the sources for building, such as patching, are performed. This function is run after the source extraction and before the build() function. The prepare() function is skipped when source extraction is skipped. This function is run inside \$srcdir.

在 `pkgver()` 之后、`build()` 之前运行。用于对源代码进行**不涉及编译**的准备工作，如应用补丁（`patch`）、生成配置文件、重命名目录等。

#### **build() Function**

The optional build() function is used to compile and/or adjust the source files in preparation to be installed by the package() function. This function is run inside \$srcdir.

包含编译/构建软件的实际命令。最常见的是运行 `./configure && make` 或其变体（如 `cmake`, `meson`, `cargo build` 等）。

#### **check() Function**

An optional check() function can be specified in which a package’s test-suite may be run. This function is run between the build() and package() functions. Be sure any exotic commands used are covered by the checkdepends array. This function is run inside \$srcdir.

包含运行软件测试套件的命令（如 `make check`, `make test`, `ninja test`）。成功通过测试有助于确保打包质量。`checkdepends` 中的依赖在此函数中可用。

### **小技巧**

**补丁文件 (.patch):**  （可选）用于修改源代码的补丁文件，通常在 `prepare()` 函数中使用 `patch -p1 < ../somefix.patch` 命令应用。

**本地文件：**  除了 `source` 中指定的文件外，还可以在 PKGBUILD 同目录下放置其他文件（如自定义配置文件、服务文件、桌面文件等），并在 `build()` 或 `package()` 函数中复制到相应位置。

## 附加脚本

Pacman has the ability to store and execute a package-specific script when it installs, removes, or upgrades a package. This allows a package to configure itself after installation and perform an opposite action upon removal.

The exact time the script is run varies with each operation, and should be self-explanatory. Note that during an upgrade operation, none of the install or remove functions will be called.

Scripts are passed either one or two “full version strings”, where a full version string is either *pkgver-pkgrel*or *epoch:pkgver-pkgrel*, if epoch is non-zero.

**pre_install**

Run right before files are extracted. One argument is passed: new package full version string.

**post_install**

Run right after files are extracted. One argument is passed: new package full version string.

**pre_upgrade**

Run right before files are extracted. Two arguments are passed in this order: new package full version string, old package full version string.

**post_upgrade**

Run after files are extracted. Two arguments are passed in this order: new package full version string, old package full version string.

**pre_remove**

Run right before files are removed. One argument is passed: old package full version string.

**post_remove**

Run right after files are removed. One argument is passed: old package full version string.

To use this feature, create a file such as *pkgname.install*and put it in the same directory as the PKGBUILD script. Then use the install directive:

```
install=pkgname.install
```

The install script does not need to be specified in the source array. A template install file is available in  */usr/share/pacman* as*proto.install* for reference with all of the available functions defined.

## 直接从版本控制系统中构建软件包

Building a developmental version of a package using sources from a version control system (VCS) is enabled by specifying the source in the form:

```
source=('directory::url#fragment?query')
```

Currently makepkg supports the **Bazaar, Git, Subversion, Fossil and Mercurial** version control systems.

For other version control systems, manual cloning of upstream repositories must be done in the prepare() function.

The source URL is divided into four components:

**directory**

(optional) Specifies an alternate directory name for makepkg to download the VCS source into.

**url**

The URL to the VCS repository. This must include the VCS in the URL protocol for makepkg to recognize this as a VCS source. If the protocol does not include the VCS name, it can be added by prefixing the URL with vcs+. For example, using a Git repository over HTTPS would have a source URL in the form: git+https://....

**fragment**

(optional) Allows specifying a revision number or branch for makepkg to checkout from the VCS. A fragment has the form type\=value, for example to checkout a given revision the source line would be source\=(url#revision\=123). The available types depends on the VCS being used:**bzr**

revision (see 'bzr help revisionspec' for details)

**fossil**

branch, commit, tag

**git**

branch, commit, tag

**hg**

branch, revision, tag

**svn**

revision

**query**

(optional) Allows specifying whether a VCS checkout should be checked for PGP-signed revisions. The source line should have the format source\=(url#fragment?signed) or source=(url?signed#fragment). Currently only supported by Git.

## 参考资料

/usr/share/pacman/  
├── PKGBUILD.proto  
├── PKGBUILD-split.proto  
├── PKGBUILD-vcs.proto  
└── proto.install

man PKGBUILD

https://wiki.archlinuxcn.org/wiki/PKGBUILD

## 参考例子(siyuan-note-bin)

```bash
# Maintainer: zxp19821005 <zxp19821005 at 163 dot com>
# Maintainer: bgt <choo-yy at qq dot com>
# Contributor: glatavento <glatavento  at outlook dot com>
# Contributor: sukanka <su975853527 at gmail dot com>
_pkgname=siyuan
pkgname="${_pkgname}-note-bin"
_appname=SiYuan
pkgver=3.2.1
_electronversion=37
pkgrel=1
pkgdesc="A local-first personal knowledge management system.(Prebuilt version.Use system-wide electron)"
arch=(
    'aarch64'
    'x86_64'
)
url="https://b3log.org/siyuan/"
_ghurl="https://github.com/siyuan-note/siyuan"
license=('AGPL-3.0-only')
provides=("${_pkgname}=${pkgver}")
conflicts=(
    "${pkgname%-bin}"
    "${_pkgname}"
)
depends=(
    "electron${_electronversion}"
)
source=(
    "${pkgname%-bin}.sh"
)
source_aarch64=("${pkgname%-bin}-${pkgver}-aarch64.deb::${_ghurl}/releases/download/v${pkgver}/${_pkgname}-${pkgver}-linux-arm64.deb")
source_x86_64=("${pkgname%-bin}-${pkgver}-x86_64.deb::${_ghurl}/releases/download/v${pkgver}/${_pkgname}-${pkgver}-linux.deb")
sha256sums=('f2fe8c189974ffb9d445e9a42bd4f1d5b60185607c3fcafae79ab44be224e013')
sha256sums_aarch64=('d0f6e2b796c730f077335a4661e712363512b911adfdb5cc419b7e02c4075c0a')
sha256sums_x86_64=('b39f78905a55bab8f16b82e90d784e4838c05b1605166d9cb3824a612cf6fc71')
_get_electron_version() {
    _electronversion="$(strings "${srcdir}/opt/${_appname}/${_pkgname}" | grep '^Chrome/[0-9.]* Electron/[0-9]' | cut -d'/' -f3 | cut -d'.' -f1)"
    echo -e "The electron version is: \033[1;31m${_electronversion}\033[0m"
}
prepare() {
    sed -i -e "
        s/@electronversion@/${_electronversion}/g
        s/@appname@/${pkgname%-bin}/g
        s/@runname@/app/g
        s/@cfgdirname@/${_appname}-Electron/g
        s/@options@/env ELECTRON_OZONE_PLATFORM_HINT=auto/g
    " "${srcdir}/${pkgname%-bin}.sh"
    bsdtar -xf "${srcdir}/data."*
    _get_electron_version
    sed -i -e "
        s/\/opt\/${_appname}\/${_pkgname}/${pkgname%-bin}/g
        s/Icon=${_pkgname}/Icon=${pkgname%-bin}/g
        s/Utility/Office/g
        3i\Name[zh_CN]=思源笔记
    " "${srcdir}/usr/share/applications/${_pkgname}.desktop"
    find "${srcdir}/opt/${_appname}/resources" -type d -exec chmod 755 {} +
}
package() {
    install -Dm755 "${srcdir}/${pkgname%-bin}.sh" "${pkgdir}/usr/bin/${pkgname%-bin}"
    install -Dm755 -d "${pkgdir}/usr/lib/${pkgname%-bin}"
    cp -Pr --no-preserve=ownership "${srcdir}/opt/${_appname}/resources/"* "${pkgdir}/usr/lib/${pkgname%-bin}"
    _icon_sizes=(16x16 32x32 48x48 64x64 128x128 256x256 512x512)
    for _icons in "${_icon_sizes[@]}";do
        install -Dm644 "${srcdir}/usr/share/icons/hicolor/${_icons}/apps/${_pkgname}.png" \
            "${pkgdir}/usr/share/icons/hicolor/${_icons}/apps/${pkgname%-bin}.png"
    done
    install -Dm644 "${srcdir}/usr/share/applications/${_pkgname}.desktop" "${pkgdir}/usr/share/applications/${pkgname%-bin}.desktop"
}
```

```bash
#翻译
_pkgname=siyuan
pkgname="siyuan-note-bin"
_appname=SiYuan
pkgver=3.2.1
_electronversion=37
pkgrel=1
pkgdesc="A local-first personal knowledge management system.(Prebuilt version.Use system-wide electron)"
arch=(
    'aarch64'
    'x86_64'
)
url="https://b3log.org/siyuan/"
_ghurl="https://github.com/siyuan-note/siyuan"
license=('AGPL-3.0-only')
provides=("siyuan=3.2.1")
conflicts=(
    "siyuan-note"
    "siyuan"
)
depends=(
    "electron37"
)
source=(
    "siyuan-note.sh"
)
source_aarch64=("siyuan-note-3.2.1-aarch64.deb::https://github.com/siyuan-note/siyuan/releases/download/v3.2.1/siyuan-3.2.1-linux-arm64.deb")
source_x86_64=("siyuan-note-3.2.1-x86_64.deb::https://github.com/siyuan-note/siyuan/releases/download/v3.2.1/siyuan-3.2.1-linux.deb")
sha256sums=('f2fe8c189974ffb9d445e9a42bd4f1d5b60185607c3fcafae79ab44be224e013')
sha256sums_aarch64=('d0f6e2b796c730f077335a4661e712363512b911adfdb5cc419b7e02c4075c0a')
sha256sums_x86_64=('b39f78905a55bab8f16b82e90d784e4838c05b1605166d9cb3824a612cf6fc71')
_get_electron_version() {
    _electronversion="$(strings "./src/opt/$SiYuan/siyuan" | grep '^Chrome/[0-9.]* Electron/[0-9]' | cut -d'/' -f3 | cut -d'.' -f1)"
    echo -e "The electron version is: \033[1;31m${_electronversion}\033[0m"
} #strings 从二进制文件中提取可打印的字符串
prepare() {
    sed -i -e "
        s/@electronversion@/37/g
        s/@appname@/siyuan-note/g
        s/@runname@/app/g
        s/@cfgdirname@/SiYuan-Electron/g
        s/@options@/env ELECTRON_OZONE_PLATFORM_HINT=auto/g
    " "./src/siyuan-note.sh"
    bsdtar -xf "./src/data."*   #解压所有匹配模式 ./src/data.* 的文件
    _get_electron_version   #调用前面定义的函数,打印electron版本
    sed -i -e "
        s/\/opt\/SiYuan\/siyuan/siyuan-note/g
        s/Icon=siyuan/Icon=siyuan-note/g
        s/Utility/Office/g
        3i\Name[zh_CN]=思源笔记
    " "./src/usr/share/applications/siyuan.desktop"
    find "./src/opt/SiYuan/resources" -type d -exec chmod 755 {} +
}
package() {
    install -Dm755 "./src/siyuan-note.sh" "./pkg/usr/bin/siyuan-note"
    install -Dm755 -d "./pkg/usr/lib/siyuan-note"
    cp -Pr --no-preserve=ownership "./src/opt/SiYuan/resources/"* "./pkg/usr/lib/siyuan-note"
    #cp复制命令
    #-P,--no-dereference选项:never follow symbolic links in SOURCE
    #-R, -r, --recursive选项:copy directories recursively
    #--no-preserve=ATTR_LIST选项:don't preserve the specified attributes
    _icon_sizes=(16x16 32x32 48x48 64x64 128x128 256x256 512x512)
    for _icons in "${_icon_sizes[@]}";do
        install -Dm644 "./src/usr/share/icons/hicolor/${_icons}/apps/siyuan.png" \
            "./pkg/usr/share/icons/hicolor/${_icons}/apps/siyuan-note.png"
    done
    install -Dm644 "./src/usr/share/applications/siyuan.desktop" "./pkg/usr/share/applications/siyuan-note.desktop"
}
#install命令,类似cp,但可以指定属性
#-D     create all leading components of DEST except the last, or all components of --target-directory, then copy SOURCE to DEST
#-m, --mode=MODE     set permission mode (as in chmod), instead of rwxr-xr-x
#-d, --directory     treat all arguments as directory names; create all components of the specified directories

```

## 参考例子(visual-studio-code-bin)

```bash
# Maintainer: D. Can Celasun <can[at]dcc[dot]im>

pkgname=visual-studio-code-bin
_pkgname=visual-studio-code
pkgver=1.103.0
pkgrel=1
pkgdesc="Visual Studio Code (vscode): Editor for building and debugging modern web and cloud applications (official binary version)"
arch=('x86_64' 'aarch64' 'armv7h')
url="https://code.visualstudio.com/"
license=('custom: commercial')
provides=('code' 'vscode')
conflicts=('code')
# Upstream has signature verification for extensions and stripping breaks it
# See https://github.com/microsoft/vscode/issues/223455#issuecomment-2610001754
options=(!strip)
install=$pkgname.install
# lsof: needed for terminal splitting, see https://github.com/Microsoft/vscode/issues/62991
# xdg-utils: needed for opening web links with xdg-open
depends=(libxkbfile gnupg gtk3 libsecret nss gcc-libs libnotify libxss glibc lsof shared-mime-info xdg-utils alsa-lib)
optdepends=('glib2: Needed for move to trash functionality'
            'libdbusmenu-glib: Needed for KDE global menu'
            'org.freedesktop.secrets: Needed for settings sync'
             # See https://github.com/MicrosoftDocs/live-share/issues/4650
            'icu69: Needed for live share' )
source=(code-${pkgver}.desktop.in::https://raw.githubusercontent.com/microsoft/vscode/${pkgver}/resources/linux/code.desktop
        code-${pkgver}-url-handler.desktop.in::https://raw.githubusercontent.com/microsoft/vscode/${pkgver}/resources/linux/code-url-handler.desktop
        code-${pkgver}-workspace.xml.in::https://raw.githubusercontent.com/microsoft/vscode/${pkgver}/resources/linux/code-workspace.xml
        ${_pkgname}-bin.sh)
source_x86_64=(code_x64_${pkgver}.tar.gz::https://update.code.visualstudio.com/${pkgver}/linux-x64/stable)
source_aarch64=(code_arm64_${pkgver}.tar.gz::https://update.code.visualstudio.com/${pkgver}/linux-arm64/stable)
source_armv7h=(code_armhf_${pkgver}.tar.gz::https://update.code.visualstudio.com/${pkgver}/linux-armhf/stable)

sha256sums=('2f1782b30c4e040efff655fd9cf477930c5a0c81ddae27749b0cbb922c1d248e'
            'c361efa7e02fcad759ed80d2fbab67877f33219b981578af6fffaf18aeb12d9b'
            '3af748dd6578a1775e8eb7248ba397b7e11840df2ea6ee234ff76fee3dc306cf'
            '8257a5ad82fa1f7dec11dfa064217b80df4cfec24f50cec7ca0ad62cf8295bfe')
sha256sums_x86_64=('1638b7ffd4fc5f65501fa814851792ba78ae5f6057fb84bbb8f2561199f9eaf7')
sha256sums_aarch64=('5b12448d3bd72b5375163105bf49d45fba0b80fadc2a53c761288b91371d863e')
sha256sums_armv7h=('3f0f64ac0163ae594d3ac5e2a5a672ed7ef09c1ec2f15e39594ec7b8a6b9f494')

_set_meta_info() {
  sed 's/@@NAME_LONG@@/Visual Studio Code/g' "$1" |\
  sed 's/@@NAME_SHORT@@/Code/g' |\
  sed 's/@@NAME@@/code/g' |\
  sed 's#@@EXEC@@#/usr/bin/code#g' |\
  sed 's/@@ICON@@/visual-studio-code/g' |\
  sed 's/@@URLPROTOCOL@@/vscode/g'
}

prepare() {
  _set_meta_info "${srcdir}/code-${pkgver}.desktop.in" > "${srcdir}/code.desktop"
  _set_meta_info "${srcdir}/code-${pkgver}-url-handler.desktop.in" > "${srcdir}/code-url-handler.desktop"
  _set_meta_info "${srcdir}/code-${pkgver}-workspace.xml.in" > "${srcdir}/code-workspace.xml"
}

_pkg() {
  if [ "${CARCH}" = "aarch64" ]; then
    echo 'VSCode-linux-arm64'
  elif [ "${CARCH}" = "armv7h" ]; then
    echo 'VSCode-linux-armhf'
  else
    echo 'VSCode-linux-x64'
  fi
}

package() {
  install -d "${pkgdir}/opt/${_pkgname}"
  install -d "${pkgdir}/usr/bin"
  install -d "${pkgdir}/usr/share/"{applications,pixmaps,mime/packages,licenses/${_pkgname}}

  install -m644 "${srcdir}/$(_pkg)/resources/app/LICENSE.rtf" "${pkgdir}/usr/share/licenses/${_pkgname}/LICENSE.rtf"
  install -m644 "${srcdir}/$(_pkg)/resources/app/resources/linux/code.png" "${pkgdir}/usr/share/pixmaps/${_pkgname}.png"
  install -m644 "${srcdir}/code.desktop" "${pkgdir}/usr/share/applications/code.desktop"
  install -m644 "${srcdir}/code-url-handler.desktop" "${pkgdir}/usr/share/applications/code-url-handler.desktop"
  install -m644 "${srcdir}/code-workspace.xml" "${pkgdir}/usr/share/mime/packages/${pkgname}-workspace.xml"
  install -Dm 644 "${srcdir}/$(_pkg)/resources/completions/bash/code" "${pkgdir}/usr/share/bash-completion/completions/code"
  install -Dm 644 "${srcdir}/$(_pkg)/resources/completions/zsh/_code" "${pkgdir}/usr/share/zsh/site-functions/_code"

  cp -r "${srcdir}/$(_pkg)/"* "${pkgdir}/opt/${_pkgname}"

  # Launcher
	install -m755 "${srcdir}/${_pkgname}-bin.sh" "${pkgdir}/usr/bin/code"
}

```

# 其他问题

## WARNING: Possibly missing firmware for module

当内核更新后重新构建初始化内存盘（initramfs）时，它会检查所有可能需要固件（firmware） 的内核模块。固件是让硬件正常工作的一段特殊代码。如果系统检测到某个模块（比如 aic94xx, wd719x, xhci\_pci 等）可能需要特定的固件文件，但这些文件在你的系统中又找不到时，就会发出这个警告

绝大多数情况下，如果你的硬件工作正常（例如，你能正常上网，声音、显卡、外设等都没问题），那么这些警告可以安全地忽略46。内核模块只是预判可能需要，但你的硬件并不实际依赖这些缺失的固件。

## 元软件包和软件包组

[元软件包和软件包组 - Arch Linux 中文维基](https://wiki.archlinuxcn.org/wiki/%E5%85%83%E8%BD%AF%E4%BB%B6%E5%8C%85%E5%92%8C%E8%BD%AF%E4%BB%B6%E5%8C%85%E7%BB%84#%E5%85%83%E8%BD%AF%E4%BB%B6%E5%8C%85)

[软件打包者](https://wiki.archlinuxcn.org/wiki/Arch_terminology#%E8%BD%AF%E4%BB%B6%E5%8C%85%E7%BB%B4%E6%8A%A4%E8%80%85 "Arch terminology")可以将一组相关的软件包定义为**元软件包**或**软件包组**。通过安装一个元软件包或软件包组，可以同时安装一系列的软件包。虽然软件包组不是一个软件包，但安装操作和一个真正的软件包相同。请参考 [pacman#安装包组](https://wiki.archlinuxcn.org/wiki/Pacman#%E5%AE%89%E8%A3%85%E5%8C%85%E7%BB%84 "Pacman")和 [PKGBUILD#groups](https://wiki.archlinuxcn.org/wiki/PKGBUILD#groups "PKGBUILD")。

### 区别

元包和普通包的区别在于元包是空的，存在元包纯粹是为了通过依赖关系将相关包链接在一起。*元包*，通常（但不总是）以“-meta”结尾，提供与包组类似的功能，因为它可以同时安装或卸载多个相关包。

每个方式都有其优缺点:

*元软件包*：

- 安装方法和其它软件包一样（[pacman#安装指定的包](https://wiki.archlinuxcn.org/wiki/Pacman#%E5%AE%89%E8%A3%85%E6%8C%87%E5%AE%9A%E7%9A%84%E5%8C%85 "Pacman")）。
- 删除方法和其他软件包一样（[pacman#删除软件包](https://wiki.archlinuxcn.org/wiki/Pacman#%E5%88%A0%E9%99%A4%E8%BD%AF%E4%BB%B6%E5%8C%85 "Pacman")）。
- 所有后续加入的软件包都会在更新时自动安装。
- 无法选择仅安装元软件包依赖的部分软件。
- 只有删除了元软件包之后，才能删除其依赖的软件包。

*软件包组*：

- 安装软件包组时会可以选择安装哪些软件包（[Pacman#安装包组](https://wiki.archlinuxcn.org/wiki/Pacman#%E5%AE%89%E8%A3%85%E5%8C%85%E7%BB%84 "Pacman")）。
- 软件包组仅是一个列表，所以无法删除一个软件包组，`pacman -R<span> </span>groupname` 会尝试删除软件包组中的所有软件。
- 新加入软件包组的软件不会在更新时自动安装。
- 可以选择安装组中的部分软件。
- 可以选择仅删除软件包组中的部分软件。

### 元软件包

最重要的元软件包是 [base](https://archlinux.org/packages/?name=base)​<sup>包</sup>。包含了 Arch Linux 安装时需要的最小软件集，包含：

- 基本的软件包，如 [glibc](https://archlinux.org/packages/?name=glibc)​<sup>包</sup> 和 [bash](https://wiki.archlinuxcn.org/wiki/Bash "Bash")
- 发行版相关工具，如 [pacman](https://wiki.archlinuxcn.org/wiki/Pacman "Pacman") 和 [systemd](https://wiki.archlinuxcn.org/wiki/Systemd "Systemd")
- POSIX 工具[核心工具](https://wiki.archlinuxcn.org/wiki/Core_utilities "Core utilities")、进程、文件、压缩工具等
- 网络工具，如 [iproute2](https://archlinux.org/packages/?name=iproute2)​<sup>包</sup>

[内核](https://wiki.archlinuxcn.org/wiki/%E5%86%85%E6%A0%B8 "内核")是可选依赖，请参考[发布说明](https://archlinux.org/news/base-group-replaced-by-mandatory-base-package-manual-intervention-required/)和[为什么 base 是元软件包](https://lists.archlinux.org/archives/list/arch-dev-public@lists.archlinux.org/thread/GRX4NIR2AQVBUGYS4K4TKBS3HGSAS456/)。

另一个元软件包是 [base-devel](https://archlinux.org/packages/?name=base-devel)​<sup>包</sup>，包含了完整的 makepkg 编译环境。[这里](https://lists.archlinux.org/archives/list/arch-dev-public@lists.archlinux.org/message/NDOV3CDX2GRWOWOQA6ALGLGFQGP7XGK7/)记录了将其从软件包组转换为元软件包的原因。

### 软件包组

软件包组常用来简化[桌面环境](https://wiki.archlinuxcn.org/wiki/%E6%A1%8C%E9%9D%A2%E7%8E%AF%E5%A2%83 "桌面环境")的安装，请参考 [Desktop environment#List of desktop environments](https://wiki.archlinuxcn.org/wiki/Desktop_environment#List_of_desktop_environments "Desktop environment").

另外一个软件包组是 [pro-audio](https://archlinux.org/groups/x86_64/pro-audio/)​<sup>包组</sup>，提供了[专业音频](https://wiki.archlinuxcn.org/wiki/%E4%B8%93%E4%B8%9A%E9%9F%B3%E9%A2%91 "专业音频")相关的软件。

请参考[软件包组列表](https://archlinux.org/groups/)。

‍
