var http = require("http");	// http服务
var fs = require("fs");	// 路径功能
var path = require("path");
var mime = require("mime");	// 文件扩展名
var cache = {};	// 缓存文件内容对象

/*请求文件不存在，发送错误请求*/
function send404(response) {
	response.writeHead(404,{"Content-Type" : "text/plain"});
	response.write("Error 404: resource not found.");
	response.end();
}

/*请求文件存在，写出正确http头，发送文件*/
function sendFile(response, filePath, fileContents) {
	response.writeHead(200,{
		"Content-Type" : mime.lookup(path.basename(filePath))
	});
	response.end(fileContents);
}

/*静态文件服务*/
function serveStatic(response, cache, absPath) {
	// 是否有缓存
	if (cache[absPath]) {
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function(exists) {
			// 文件是否存在
			if (exists) {
				fs.readFile(absPath, function(err, data){
					if (err) {
						send404(response);
					} else {
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}
				});
			} else {
				send404(response);
			}
		})
	}
}

/*创建http服务*/
var server = http.createServer(function(request, response) {
	var filePath = false;

	if (request.url == "/") {
		filePath = "public/index.html";
	} else {
		filePath = "public" + request.url;
	}

	var absPath = "./" + filePath;
	serveStatic(response, cache, absPath);
});

/*启动http服务*/
server.listen(3000, function() {
	console.log("Server listening on port 3000.");
});

/*设置Socket.IO服务器*/
var chatServer = require("./lib/chat_server");
chatServer.listen(server);

