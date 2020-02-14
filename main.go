package main

import (
	"pnr/ping"
	"pnr/version"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/-/ping", ping.Ping())
	r.GET("/-/version", version.Version())
	r.Run()
}
