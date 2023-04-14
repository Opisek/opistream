package webpageService

import (
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"
)

//
// Data Types
//

type webpageService struct {
	htmlFilesMap         map[string]bool
	defaultCacheDuration int
}

func New() webpageService {
	return webpageService{getHtmlFilesMap(), 60 * 60 * 24 * 365}
}

//
// Handlers
//

func HandleCss(s *webpageService) http.Handler {
	return handleCache(s.defaultCacheDuration, handleCompression("text/css", http.StripPrefix("/css/", http.FileServer(http.Dir("public/css")))))
}
func HandleJs(s *webpageService) http.Handler {
	return handleCache(s.defaultCacheDuration, handleCompression("text/javascript", http.StripPrefix("/js/", http.FileServer(http.Dir("public/js")))))
}
func HandleImg(s *webpageService) http.Handler {
	return handleCache(s.defaultCacheDuration, http.StripPrefix("/images/", http.FileServer(http.Dir("public/img"))))
}
func HandleHtml(s *webpageService) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { handleView(w, r, s) })
}

//
// Data Loader
//

func getHtmlFilesMap() map[string]bool {
	htmlFiles, err := os.ReadDir("public/html")
	if err != nil {
		panic(err)
	}

	htmlFilesMap := map[string]bool{}
	for _, file := range htmlFiles {
		htmlFilesMap[file.Name()] = true
	}

	return htmlFilesMap
}

//
// Compression Determination
//

func getCompressionType(r *http.Request) string {
	return "gzip"
}

func supportsCompression(r *http.Request) bool {
	return strings.Contains(r.Header.Get("Accept-Encoding"), getCompressionType(r))
}

func getCompressedExtension(r *http.Request) string {
	if supportsCompression(r) {
		return ".gz"
	} else {
		return ""
	}
}

//
// File Handling
//

func handleCache(seconds int, h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// set matching compression encoding
		w.Header().Set("Cache-Control", "public, max-age="+fmt.Sprint(seconds))

		// forward request to the next handler in the chain
		h.ServeHTTP(w, r)
	})
}

func handleCompression(contentType string, h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// if no encoding is supported, immediatel forward to the next handler
		if !supportsCompression(r) {
			h.ServeHTTP(w, r)
			return
		}

		// add the compression extension to the path
		r2 := new(http.Request)
		*r2 = *r
		r2.URL = new(url.URL)
		*r2.URL = *r.URL
		r2.URL.Path = r.URL.Path + getCompressedExtension(r)

		// set matching compression encoding
		w.Header().Set("Content-Encoding", getCompressionType(r))
		w.Header().Set("Content-Type", contentType)

		// forward request to the next handler in the chain
		h.ServeHTTP(w, r2)
	})
}

func handleView(w http.ResponseWriter, r *http.Request, s *webpageService) {
	// get the requested filename
	path := r.URL.Path[1:]
	if path == "" {
		path = "index"
	}
	if !(s.htmlFilesMap)[path+".html"] {
		path = "404"
	}

	// finally, send a file if the user had not been redirected
	if supportsCompression(r) {
		w.Header().Set("Content-Encoding", getCompressionType(r))
		w.Header().Set("Content-Type", "text/html")
	}
	http.ServeFile(w, r, "public/html/"+path+".html"+getCompressedExtension(r))
}
