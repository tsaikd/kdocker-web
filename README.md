kdocker-web
===========

Docker simple web UI

本來都用 [Shipyard] 在管 [Docker]

不過最近 [Shipyard] 改版把架構弄複雜了, 用起來很不爽

只好自己硬幹一個簡單版的管理介面

目前是純 HTML

但是有用 WebSocket

所以還是要放到 Web Server 上面才能跑

## 注意

本專案還沒做使用者認證的部份

請自行用防火牆來處理安全性的問題

## Docker 設定 (Ubuntu)

* /etc/default/docker

	> ```
DOCKER_OPTS="-api-enable-cors=true -H tcp://0.0.0.0:4243 -H unix:///var/run/docker.sock"
```

	* ```-api-enable-cors=true``` 是為了要在 Browser 直接連 docker remote api
	* ```-H tcp://0.0.0.0:4243``` 是要監聽所有網卡的 4243 Port

[Shipyard]: https://github.com/shipyard/shipyard
[Docker]: https://www.docker.io/
