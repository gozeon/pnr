package version

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func Version() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"version": "0.0.0",
		})
	}
}