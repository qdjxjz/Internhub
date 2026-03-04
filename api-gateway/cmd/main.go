package main

import (
	"bytes"
	"io"
	"log"
	"net/http"

	"time"

	"internhub/pkg/logger"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	"strings"
    "github.com/golang-jwt/jwt/v5"

	"fmt"
)

func main() {
	// 初始化日志系统
	if err := logger.Init(); err != nil {
		log.Fatal("failed to init logger")
	}

	gin.SetMode(gin.ReleaseMode)

	r := gin.New()
	r.Use(gin.Recovery())

	api := r.Group("/api/v1")
	{
    	api.POST("/users/register", proxyRegister)

		// 受保护测试接口
    	api.GET("/protected", JWTMiddleware(), func(c *gin.Context) {
        	userID, _ := c.Get("user_id")
        	c.JSON(http.StatusOK, gin.H{
            	"message": "protected route",
            	"user_id": userID,
        })
    })
	}

	r.GET("/health", func(c *gin.Context) {
		logger.Log.Info("health check called")
		c.JSON(http.StatusOK, gin.H{
			"status": "gateway ok",
		})
	})
	// Prometheus metrics
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))
	r.Run(":8080")
}

func proxyRegister(c *gin.Context) {
    // 读取请求体
    body, err := io.ReadAll(c.Request.Body)
    if err != nil {
        logger.Log.Error("failed to read request body")
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
        return
    }

    // ⚠️ 这里后面会改成从环境变量读取
    targetURL := "http://127.0.0.1:8081/api/v1/users/register"

    // 创建新的请求
    req, err := http.NewRequest("POST", targetURL, bytes.NewBuffer(body))
    if err != nil {
        logger.Log.Error("failed to create proxy request")
        c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
        return
    }

    // 复制 header（非常重要）
    req.Header = c.Request.Header.Clone()

    // 带超时的 client（生产级必须）
    client := &http.Client{
        Timeout: 5 * time.Second,
    }

    resp, err := client.Do(req)
    if err != nil {
        logger.Log.Error("auth service unavailable")
        c.JSON(http.StatusServiceUnavailable, gin.H{"error": "user service unavailable"})
        return
    }
    defer resp.Body.Close()

    respBody, _ := io.ReadAll(resp.Body)

    logger.Log.Info("proxy register success")

    // 原样返回
    c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), respBody)
}

var jwtSecret = []byte("internhub-secret")

func JWTMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
            c.Abort()
            return
        }

		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization format"})
			c.Abort()
			return
		}

        tokenString := strings.TrimPrefix(authHeader, "Bearer ")

        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return jwtSecret, nil
		})

        if err != nil || !token.Valid {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
            c.Abort()
            return
        }

        claims, ok := token.Claims.(jwt.MapClaims)
        if !ok {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid claims"})
            c.Abort()
            return
        }

        if exp, ok := claims["exp"].(float64); ok {
            if int64(exp) < time.Now().Unix() {
                c.JSON(http.StatusUnauthorized, gin.H{"error": "token expired"})
                c.Abort()
                return
            }
        }

        c.Set("user_id", claims["user_id"])
        c.Next()
    }
}