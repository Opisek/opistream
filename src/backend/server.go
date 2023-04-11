package main

import (
	"fmt"

	webpageService "github.com/Opisek/opistream/services/webpage"
)

func main() {
	fmt.Println("test")
	webpageService.StartWebpageService()
}
