kdocker-web
===========

Docker simple web UI

[Shipyard]: https://github.com/shipyard/shipyard
[Docker]: https://www.docker.io/

## DEMO

http://tsaikd.github.io/kdocker-web/

## Config Docker Startup Options (ex: Ubuntu)

* /etc/default/docker

```
DOCKER_OPTS="-api-enable-cors=true -H tcp://0.0.0.0:4243 -H unix:///var/run/docker.sock"
```

## Install

Just put the whole project to any web site, like: nginx, apache.

Open your browser and go to the project folder.

Enjoy!

## Warning

There is no any authentication in the project.

Please use the firewall for security by hand.

========================================================================================
# 中文版開始

## Docker 設定 (Ubuntu)

* /etc/default/docker

```
DOCKER_OPTS="-api-enable-cors=true -H tcp://0.0.0.0:4243 -H unix:///var/run/docker.sock"
```

	* -api-enable-cors=true 是為了要在 Browser 直接連 docker remote api
	* -H tcp://0.0.0.0:4243 是要監聽所有網卡的 4243 Port
	* 更多的設定項目請參考 [Docker] 官網

## 安裝

把整個 Project 丟到 nginx 或是 apache 之類的目錄

用瀏覽器直接連網址就可以了

一開始會跳到設定頁面去設定 Docker remote API 的參數

重新載入頁面就可以用了

## 注意

因為還沒做使用者認證的部份

就自行用防火牆來處理安全性的問題吧

## KD 碎碎唸

本來都用 [Shipyard] 在管 [Docker]

不過最近(2014/02) [Shipyard] 改版把架構弄複雜了, 用起來很不爽

只好自己硬幹一個簡單版的管理介面

目前是純 HTML

但是有用 WebSocket

所以還是要放到 Web Server 上面才能跑
