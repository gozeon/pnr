package main

import (
	"pnr/ping"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/-/ping", ping.Ping())
	r.Run()
}
